const { StringSelectMenuOptionBuilder, TextInputStyle, ContextMenuCommandBuilder, ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('modalGestion')
        .setType(ApplicationCommandType.Message),
    async modal(interaction) {
        if (interaction.guild.id !== process.env.GUILD_ID) return;
        if (!G6.data.agents[interaction.user.id]) return  await interaction.reply({ content: "Vous devez être un employé de G6 pour faire cela.", flags: MessageFlags.Ephemeral });

        await interaction.deferReply({ content: "En cours de chargement..", flags: MessageFlags.Ephemeral })

        const agentList = []
        for (const [DiscordID, agentInfos] of Object.entries(G6.data.agents)) {
            agentList.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(agentInfos.code_agent)
                    .setDescription(`${agentInfos.prenom} ${agentInfos.nom}`)
                    .setValue(DiscordID),
            )
        }

        switch (interaction.customId.split("_")[1]) {
            case "service":
                let id;
                id = Math.floor(Math.random() * 100);
                while (G6.data.missions[id]) {
                    id = Math.floor(Math.random() * 100);
                }

                G6.data.missions[id] = {
                    "mission": interaction.fields.getStringSelectValues("mission")[0],
                    "vehicule": interaction.fields.getStringSelectValues("vehicule")[0],
                    "plaque": "SECHS" + interaction.fields.getTextInputValue("plaque"),
                    "conducteur": interaction.fields.getStringSelectValues("conducteur")[0],
                    "agent2": "",
                    "agent3": "",
                    "agent4": ""
                }

                G6.utils.saveData();

                const serviceBtn = new ButtonBuilder().setCustomId('gestion_serviceAgents_' + id).setLabel('Ajouter des agents').setStyle(ButtonStyle.Secondary);
                const serviceRow = new ActionRowBuilder().addComponents(serviceBtn);

                await interaction.editReply({ content: "Mission créée ! Cliquez ci-dessous pour ajouter des agents", components: [serviceRow], flags: MessageFlags.Ephemeral })

                G6.utils.updateService(interaction.user.id)
                G6.utils.serviceLogs(null, id, interaction.user.id)

                break;
            case "agentService":
                const agent2 = interaction.fields.getStringSelectValues("agent2")[0] || ""
                const agent3 = interaction.fields.getStringSelectValues("agent3")[0] || ""
                const agent4 = interaction.fields.getStringSelectValues("agent4")[0] || ""
                const oldService = {...G6.data.missions[interaction.customId.split("_")[2]]}

                if (!G6.data.missions[interaction.customId.split("_")[2]]) return await interaction.editReply({ content: "Mission introuvable", flags: MessageFlags.Ephemeral })

                G6.data.missions[interaction.customId.split("_")[2]].agent2 = agent2
                G6.data.missions[interaction.customId.split("_")[2]].agent3 = agent3
                G6.data.missions[interaction.customId.split("_")[2]].agent4 = agent4

                G6.utils.saveData();

                await interaction.editReply({ content: "Agent ajoutés !", flags: MessageFlags.Ephemeral })

                G6.utils.updateService(interaction.user.id)
                G6.utils.serviceLogs(oldService, interaction.customId.split("_")[2], interaction.user.id)

                break;
            case "editService":
                const editOldService = {...G6.data.missions[interaction.customId.split("_")[2]]}
                const editConducteur = interaction.fields.getStringSelectValues("conducteur")[0]
                const editAgent2 = interaction.fields.getStringSelectValues("agent2")[0] === "null" ? "" : interaction.fields.getStringSelectValues("agent2")[0] || ""
                const editAgent3 = interaction.fields.getStringSelectValues("agent3")[0] === "null" ? "" : interaction.fields.getStringSelectValues("agent3")[0] || ""
                const editAgent4 = interaction.fields.getStringSelectValues("agent4")[0] === "null" ? "" : interaction.fields.getStringSelectValues("agent4")[0] || ""

                if (!G6.data.missions[interaction.customId.split("_")[2]]) return await interaction.editReply({ content: "Mission introuvable", flags: MessageFlags.Ephemeral })

                G6.data.missions[interaction.customId.split("_")[2]].conducteur = editConducteur
                G6.data.missions[interaction.customId.split("_")[2]].agent2 = editAgent2
                G6.data.missions[interaction.customId.split("_")[2]].agent3 = editAgent3
                G6.data.missions[interaction.customId.split("_")[2]].agent4 = editAgent4

                G6.utils.saveData();

                await interaction.editReply({ content: "Mission modifié !", flags: MessageFlags.Ephemeral })

                G6.utils.updateService(interaction.user.id)
                G6.utils.serviceLogs(editOldService, interaction.customId.split("_")[2], interaction.user.id)

                break;
            case "weapon":
                const armeLourde = interaction.fields.getStringSelectValues("lourde")[0] === "null" ? "" : interaction.fields.getStringSelectValues("lourde")[0] || ""
                const armeLegere = interaction.fields.getStringSelectValues("legere")[0] === "null" ? "" : interaction.fields.getStringSelectValues("legere")[0]  || ""
                const taser = interaction.fields.getStringSelectValues("taser")[0] === "null" ? "" : interaction.fields.getStringSelectValues("taser")[0]  || ""

                if (!G6.data.agents[interaction.user.id]) return await interaction.editReply({ content: "Vous n'êtes pas agent", flags: MessageFlags.Ephemeral })

                if (G6.data.agents[interaction.user.id].armement.armeLourde !== armeLourde) {
                    if (G6.data.agents[interaction.user.id].armement.armeLourde === "") {
                        G6.utils.weaponLogs(armeLourde, true, interaction.user.id)
                    } else if (armeLourde === "") {
                        G6.utils.weaponLogs(G6.data.agents[interaction.user.id].armement.armeLourde, false, interaction.user.id)
                    } else {
                        await G6.utils.weaponLogs(G6.data.agents[interaction.user.id].armement.armeLourde, false, interaction.user.id)
                        G6.utils.weaponLogs(armeLourde, true, interaction.user.id)
                    }
                }

                if (G6.data.agents[interaction.user.id].armement.armeLegere !== armeLegere) {
                    if (G6.data.agents[interaction.user.id].armement.armeLegere === "") {
                        if (armeLegere.split("_")[0] !== "perso") {
                            G6.utils.weaponLogs(armeLegere, true, interaction.user.id)
                        }
                    } else if (armeLegere === "") {
                        if (G6.data.agents[interaction.user.id].armement.armeLegere.split("_")[0] !== "perso") {
                            G6.utils.weaponLogs(G6.data.agents[interaction.user.id].armement.armeLegere, false, interaction.user.id)
                        }
                    } else {
                        if (G6.data.agents[interaction.user.id].armement.armeLegere.split("_")[0] !== "perso") {
                            await G6.utils.weaponLogs(G6.data.agents[interaction.user.id].armement.armeLegere, false, interaction.user.id)
                        }
                        if (armeLegere.split("_")[0] !== "perso") {
                            G6.utils.weaponLogs(armeLegere, true, interaction.user.id)
                        }
                    }
                }

                if (G6.data.agents[interaction.user.id].armement.taser !== taser) {
                    if (G6.data.agents[interaction.user.id].armement.taser === "") {
                        if (taser.split("_")[0] !== "perso") {
                            G6.utils.weaponLogs(taser, true, interaction.user.id)
                        }
                    } else if (taser === "") {
                        if (G6.data.agents[interaction.user.id].armement.taser.split("_")[0] !== "perso") {
                            G6.utils.weaponLogs(G6.data.agents[interaction.user.id].armement.taser, false, interaction.user.id)
                        }
                    } else {
                        if (G6.data.agents[interaction.user.id].armement.taser.split("_")[0] !== "perso") {
                            await G6.utils.weaponLogs(G6.data.agents[interaction.user.id].armement.taser, false, interaction.user.id)
                        }
                        if (taser.split("_")[0] !== "perso") {
                            G6.utils.weaponLogs(taser, true, interaction.user.id)
                        }
                    }
                }

                G6.data.agents[interaction.user.id].armement = {
                    "armeLourde": armeLourde,
                    "armeLegere": armeLegere,
                    "taser": taser
                }

                G6.utils.saveData();

                await interaction.editReply({ content: "Armement modifié !", flags: MessageFlags.Ephemeral })

                G6.utils.updateWeapons(interaction.user.id);

                break;
        }
    }
}