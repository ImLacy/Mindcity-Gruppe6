const { ModalBuilder, LabelBuilder, StringSelectMenuOptionBuilder, TextInputStyle, ContextMenuCommandBuilder, ApplicationCommandType,
    StringSelectMenuBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('gestion')
        .setType(ApplicationCommandType.Message),
    async button(interaction) {
        if (interaction.guild.id !== process.env.GUILD_ID) return;
        if (!G6.data.agents[interaction.user.id]) return  await interaction.reply({ content: "Vous devez être un employé de G6 pour faire cela.", flags: MessageFlags.Ephemeral });


        const agentList = []
        for (const [DiscordID, agentInfos] of Object.entries(G6.data.agents)) {
            agentList.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(agentInfos.code_agent)
                    .setDescription(`${agentInfos.prenom} ${agentInfos.nom}`)
                    .setValue(DiscordID),
            )
        }

        const serviceList = []
        for (const [MissionID, missionDetails] of Object.entries(G6.data.missions)) {
            serviceList.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${G6.config.lang.missions[missionDetails.mission]}`)
                    .setDescription(`${G6.config.lang.vehicule[missionDetails.vehicule]} (${missionDetails.plaque})`)
                    .setValue(MissionID),
            )
        }

        switch (interaction.customId.split("_")[1]) {
            case "newservice":
                const serviceModal = new ModalBuilder().setCustomId('modalGestion_service').setTitle('Nouveau véhicule');

                const conducteur = new StringSelectMenuBuilder()
                    .setCustomId('conducteur')
                    .setPlaceholder('Qui conduit le véhicule ?')
                    .setRequired(true)
                    .addOptions(...agentList);

                const mission = new StringSelectMenuBuilder()
                    .setCustomId('mission')
                    .setPlaceholder('Mission')
                    .setRequired(true)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Tournée supérettes")
                            .setValue("tour_sup"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Sécu HR")
                            .setValue("secu_hr"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Sécu Concessionaire")
                            .setValue("concess"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Sécu Evenement")
                            .setValue("event"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Taxes/Subventions")
                            .setValue("taxes"),
                    );

                const vehicule = new StringSelectMenuBuilder()
                    .setCustomId('vehicule')
                    .setPlaceholder('Rôle du véhicule')
                    .setRequired(true)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Ouvreuse")
                            .setValue("ouvreuse"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Véhicule principal")
                            .setValue("mainVeh"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Suiveuse")
                            .setValue("suiveuse"),
                    );

                const plaque = new TextInputBuilder()
                    .setCustomId('plaque')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Numéro de plaque (Uniquement le numéro, pas la plaque complète)');

                serviceModal.addLabelComponents([
                    new LabelBuilder()
                        .setLabel('Conducteur')
                        .setStringSelectMenuComponent(conducteur),
                    new LabelBuilder()
                        .setLabel('Mission')
                        .setStringSelectMenuComponent(mission),
                    new LabelBuilder()
                        .setLabel('Rôle du véhicule')
                        .setStringSelectMenuComponent(vehicule),
                    new LabelBuilder()
                        .setLabel('Plaque')
                        .setTextInputComponent(plaque),
                ]);

                await interaction.showModal(serviceModal);
                break;

            case "editservice":
                const service = new StringSelectMenuBuilder()
                    .setCustomId('selectGestion_editservice')
                    .setPlaceholder('Quel service modifier ?')
                    .addOptions(...serviceList);

                const row = new ActionRowBuilder().addComponents(service);

                await interaction.reply({
                    content: 'Quel service voulez-vous modifier ?',
                    components: [row],
                    flags: MessageFlags.Ephemeral
                });

                break;

            case "endservice":
                const endService = new StringSelectMenuBuilder()
                    .setCustomId('selectGestion_endservice')
                    .setPlaceholder('Quel service terminer ?')
                    .addOptions(...serviceList);

                const endRow = new ActionRowBuilder().addComponents(endService);

                await interaction.reply({
                    content: 'Quel service voulez-vous terminer ?',
                    components: [endRow],
                    flags: MessageFlags.Ephemeral
                });

                break;

            case "serviceAgents":
                const agentModal = new ModalBuilder().setCustomId('modalGestion_agentService_' + interaction.customId.split("_")[2]).setTitle('Nouveau véhicule');

                const agent2 = new StringSelectMenuBuilder()
                    .setCustomId('agent2')
                    .setPlaceholder('Deuxième agent')
                    .setRequired(false)
                    .addOptions(...agentList);

                const agent3 = new StringSelectMenuBuilder()
                    .setCustomId('agent3')
                    .setPlaceholder('Troisième agent')
                    .setRequired(false)
                    .addOptions(...agentList);

                const agent4 = new StringSelectMenuBuilder()
                    .setCustomId('agent4')
                    .setPlaceholder('Quatrième agent')
                    .setRequired(false)
                    .addOptions(...agentList);

                agentModal.addLabelComponents([
                    new LabelBuilder()
                        .setLabel('Agent 2')
                        .setStringSelectMenuComponent(agent2),
                    new LabelBuilder()
                        .setLabel('Agent 3')
                        .setStringSelectMenuComponent(agent3),
                    new LabelBuilder()
                        .setLabel('Agent 4')
                        .setStringSelectMenuComponent(agent4),
                ]);

                await interaction.showModal(agentModal);

                break;
            case "weapon":
                const weaponModal = new ModalBuilder().setCustomId('modalGestion_weapon').setTitle('Modifier mon armement');

                const armeLourde = new StringSelectMenuBuilder()
                    .setCustomId('lourde')
                    .setPlaceholder('Quel est votre arme lourde ?')
                    .setRequired(false)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Aucune")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLourde === "")
                            .setValue("null"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Fusil à Pompe")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLourde === "fap")
                            .setValue("fap"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Fusil à Pompe Bullpup")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLourde === "fap_bullpup")
                            .setValue("fap_bullpup"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("SMG")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLourde === "smg")
                            .setValue("smg"),
                    );
                const armeLegere = new StringSelectMenuBuilder()
                    .setCustomId('legere')
                    .setPlaceholder('Quel est votre arme de poing ?')
                    .setRequired(false)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Aucune")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLegere === "")
                            .setValue("null"),
                    new StringSelectMenuOptionBuilder()
                            .setLabel("Revolver")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLegere === "revolver")
                            .setValue("revolver"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Revolver (Personnel)")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLegere === "perso_revolver")
                            .setValue("perso_revolver"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Pistolet")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLegere === "pistolet")
                            .setValue("pistolet"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Pistolet (Personnel)")
                            .setDefault(G6.data.agents[interaction.user.id].armement.armeLegere === "perso_pistolet")
                            .setValue("perso_pistolet"),
                    );

                const taser = new StringSelectMenuBuilder()
                    .setCustomId('taser')
                    .setPlaceholder('Choisir un Taser')
                    .setRequired(false)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Aucun")
                            .setDefault(G6.data.agents[interaction.user.id].armement.taser === "")
                            .setValue("null"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Taser")
                            .setDefault(G6.data.agents[interaction.user.id].armement.taser === "taser")
                            .setValue("taser"),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Taser (Personnel)")
                            .setDefault(G6.data.agents[interaction.user.id].armement.taser === "perso_taser")
                            .setValue("perso_taser"),
                    );

                weaponModal.addLabelComponents([
                    new LabelBuilder()
                        .setLabel('Arme Lourde')
                        .setStringSelectMenuComponent(armeLourde),
                    new LabelBuilder()
                        .setLabel('Arme de Poing')
                        .setStringSelectMenuComponent(armeLegere),
                    new LabelBuilder()
                        .setLabel('Taser')
                        .setStringSelectMenuComponent(taser),
                ]);

                await interaction.showModal(weaponModal);
                break;
        }
    }
}