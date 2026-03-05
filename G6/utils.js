const fs = require("fs");
const { REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');


module.exports = {
    saveData() {
        fs.writeFileSync(`${__basedir}/G6/${G6.dev ? 'dev/' : ''}data.json`, JSON.stringify(G6.data, null, 2));
    },
    async registerCommands() {
        const commandsList = []
        G6.commands = []

        fs.readdirSync(__basedir + '/interactions').forEach(typeDir => {
            fs.readdirSync(__basedir + '/interactions/' + typeDir).forEach(dir => {
                fs.readdirSync( __basedir + `/interactions/${typeDir}/${dir}`).filter(file => file.endsWith('.js')).forEach(file => {
                    const command = require(__basedir + `/interactions/${typeDir}/${dir}/${file}`);

                    if ('data' in command) {
                        let commandData = command.data.toJSON()
                        console.log(`Ajout de l'interaction de type ${typeDir}, du nom de ${commandData.name} présente dans le dossier ${dir}`)

                        G6.commands[commandData.name] = {"dir": dir, "cmd": command}

                        if ('execute' in command) {
                            commandsList.push(commandData);
                        }
                    } else {
                        console.log(`La commande de type ${typeDir} ${dir}/${file} n'a pas la propriété data.`)
                    }
                });
            });
        });

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        await (async () => {
            try {
                console.log(`Lancement de la réinitialisation de ${commandsList.length} commandes.`)

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    {body: commandsList},
                );

                console.log(`Réinitialisation de ${data.length} commandes effectués avec succès`)
            } catch (err) {
               console.log(err)
            }
        })();
    },
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    async arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, i) => val === sortedB[i]);
    },
    async updateService(edit_by) {
        const serviceEmbed = new EmbedBuilder()
            .setColor("#1d7b25")
            .setTitle('Service')
            .setTimestamp()

        if (edit_by) serviceEmbed.setFooter({ text: `Modifié par ${G6.data.agents[edit_by].prenom} ${G6.data.agents[edit_by].nom}` });

        const serviceRow = new ActionRowBuilder();

        const startBtn = new ButtonBuilder().setCustomId('gestion_newservice').setLabel('Nouvelle mission').setStyle(ButtonStyle.Primary);
        const editBtn = new ButtonBuilder().setCustomId('gestion_editservice').setLabel('Modifier une mission').setStyle(ButtonStyle.Secondary);
        const endBtn = new ButtonBuilder().setCustomId('gestion_endservice').setLabel('Finir une mission').setStyle(ButtonStyle.Danger);
        serviceRow.addComponents(startBtn, editBtn, endBtn);

        for (const [conducteur, missionDetails] of Object.entries(G6.data.missions)) {
            serviceEmbed.addFields({
                name: `${G6.config.lang.missions[missionDetails.mission]} - ${G6.config.lang.vehicule[missionDetails.vehicule]} (${missionDetails.plaque})`,
                value: `Conducteur : ${G6.data.agents[missionDetails.conducteur].code_agent}${(missionDetails.agent2 !== "" || missionDetails.agent3 !== "" || missionDetails.agent4 !== "") ? ", Agents : " : ""}` + [missionDetails.agent2, missionDetails.agent3, missionDetails.agent4]
                    .filter(agent => agent !== "")
                    .map(agent => G6.data.agents[agent].code_agent)
                    .join(", ")
            })
        }

        const message = await G6.channels.gestion.messages.fetch(G6.data.service_msgid);

        await message.edit({embeds: [serviceEmbed], components: [serviceRow]})
    },
    async serviceLogs(oldMission, missionID, edit_by) {
        const newMission = G6.data.missions[missionID]

        const serviceEmbed = new EmbedBuilder()
            .setFooter({ text: `Modifié par ${G6.data.agents[edit_by].prenom} ${G6.data.agents[edit_by].nom}` })
            .setTimestamp()

        if (oldMission) {
            if (newMission) {
                const oldMissionAgents = [oldMission.agent2, oldMission.agent3, oldMission.agent4]
                const newMissionAgents = [newMission.agent2, newMission.agent3, newMission.agent4]
                let edited = false

                serviceEmbed.setTitle("Modification des agents")
                serviceEmbed.setColor("#ffaf1a")
                serviceEmbed.setDescription(`${G6.config.lang.missions[oldMission.mission]} - ${G6.config.lang.vehicule[oldMission.vehicule]} (${oldMission.plaque})`)

                if (oldMission.conducteur !== newMission.conducteur) {
                    edited = true
                    serviceEmbed.addFields({
                        name: "Changement de conducteur",
                        value: `Ancien : ${G6.data.agents[oldMission.conducteur].code_agent}, Nouveau : ${G6.data.agents[newMission.conducteur].code_agent}`
                    })
                }

                if (!await G6.utils.arraysEqual(oldMissionAgents, newMissionAgents)) {
                    if (!oldMissionAgents.includes(newMission.agent2) || !oldMissionAgents.includes(newMission.agent3) || !oldMissionAgents.includes(newMission.agent4)) {
                        edited = true
                        serviceEmbed.addFields({
                            name: "Ajout des agents :",
                            value: [newMission.agent2, newMission.agent3, newMission.agent4]
                                .filter(agent => agent && !oldMissionAgents.includes(agent))
                                .map(agent => G6.data.agents[agent].code_agent)
                                .join(", ")
                        })
                    }

                    if (!newMissionAgents.includes(oldMission.agent2) || !newMissionAgents.includes(oldMission.agent3) || !newMissionAgents.includes(oldMission.agent4)) {
                        edited = true
                        serviceEmbed.addFields({
                            name: "Retrait des agents :",
                            value: [oldMission.agent2, oldMission.agent3, oldMission.agent4]
                                .filter(agent => agent && !newMissionAgents.includes(agent))
                                .map(agent => G6.data.agents[agent].code_agent)
                                .join(", ")
                        })
                    }
                }

                if (!edited) return console.log("ERR : Aucune modification d'agent ");
            } else {
                serviceEmbed.setTitle("Fin de service")
                serviceEmbed.setColor("#c9262b")
                serviceEmbed.addFields({
                    name:`${G6.config.lang.missions[oldMission.mission]} - ${G6.config.lang.vehicule[oldMission.vehicule]} (${oldMission.plaque})`,
                    value: `Conducteur : ${G6.data.agents[oldMission.conducteur].code_agent}, Agents : 
                            ${oldMission.agent2 === "" ? "" : G6.data.agents[oldMission.agent2].code_agent}
                            ${oldMission.agent3 === "" ? "" : ", " + G6.data.agents[oldMission.agent3].code_agent}
                            ${oldMission.agent4 === "" ? "" : ", " + G6.data.agents[oldMission.agent4].code_agent}`
                })
            }
        } else {
            serviceEmbed.setTitle("Nouveau service")
            serviceEmbed.setColor("#1d7b25")
            serviceEmbed.addFields({
                name:`${G6.config.lang.missions[newMission.mission]} - ${G6.config.lang.vehicule[newMission.vehicule]} (${newMission.plaque})`,
                value: `Conducteur : ${G6.data.agents[newMission.conducteur].code_agent}`
            })
        }

        await G6.channels.service.send({embeds: [serviceEmbed]})
    },
    async updateWeapons(edit_by) {
        const weaponEmbed = new EmbedBuilder()
            .setColor("#1d7b25")
            .setTitle('Armement')
            .setTimestamp()

        if (edit_by) weaponEmbed.setFooter({ text: `Modifié par ${G6.data.agents[edit_by].prenom} ${G6.data.agents[edit_by].nom}` });

        const weaponBtn = new ButtonBuilder().setCustomId('gestion_weapon').setLabel('Modifier mon armement').setStyle(ButtonStyle.Primary);
        const weaponRow = new ActionRowBuilder().addComponents(weaponBtn);

        for (const [AgentID, AgentDetails] of Object.entries(G6.data.agents)) {
            if (!(AgentDetails.armement.armeLourde === "" && AgentDetails.armement.armeLegere === "" && AgentDetails.armement.taser === "")) {
                weaponEmbed.addFields({
                    name: `${AgentDetails.prenom} ${AgentDetails.nom} (${AgentDetails.code_agent})`,
                    value: [G6.config.lang.weapons[AgentDetails.armement.armeLourde], G6.config.lang.weapons[AgentDetails.armement.armeLegere], G6.config.lang.weapons[AgentDetails.armement.taser]].filter(Boolean).join(', ')
                })
            }
        }


        const message = await G6.channels.gestion.messages.fetch(G6.data.weapon_msgid);

        await message.edit({embeds: [weaponEmbed], components: [weaponRow]})
    },
    async weaponLogs(weapon, retrait, agent) {
        const weaponEmbed = new EmbedBuilder()
            .setColor(retrait ? "#c9262b" : "#26c934")
            .setTitle(retrait ? "Retrait d'une arme" : "Dépôt d'une arme")
            .setDescription("Arme : " + G6.config.lang.weapons[weapon])
            .setFooter({ text: `Effectué par ${G6.data.agents[agent].prenom} ${G6.data.agents[agent].nom}` })
            .setTimestamp()

        await G6.channels.weapons.send({embeds: [weaponEmbed]})
    }
}


Date.prototype.addMinutes = function(m){
    this.setMinutes(this.getMinutes()+m);
    return this;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}