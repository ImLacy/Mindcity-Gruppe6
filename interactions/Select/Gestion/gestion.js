const { ModalBuilder, LabelBuilder, StringSelectMenuOptionBuilder, TextInputStyle, ContextMenuCommandBuilder, ApplicationCommandType,
    StringSelectMenuBuilder, MessageFlags
} = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('selectGestion')
        .setType(ApplicationCommandType.Message),
    async select(interaction) {
        if (interaction.guild.id !== process.env.GUILD_ID) return;
        if (!G6.data.agents[interaction.user.id]) return  await interaction.reply({ content: "Vous devez être un employé de G6 pour faire cela.", flags: MessageFlags.Ephemeral });


        if (interaction.customId.split("_")[1] === "editservice") {
            const agentModal = new ModalBuilder().setCustomId('modalGestion_editService_' + interaction.values[0]).setTitle('Modifier une mission');

            let conducteurList = []
            let agent2List = [
                new StringSelectMenuOptionBuilder()
                    .setLabel("Aucun")
                    .setDefault(G6.data.missions[interaction.values[0]].agent2 === "")
                    .setValue("null"),
            ]
            let agent3List = [
                new StringSelectMenuOptionBuilder()
                    .setLabel("Aucun")
                    .setDefault(G6.data.missions[interaction.values[0]].agent3 === "")
                    .setValue("null"),
            ]
            let agent4List = [
                new StringSelectMenuOptionBuilder()
                    .setLabel("Aucun")
                    .setDefault(G6.data.missions[interaction.values[0]].agent4 === "")
                    .setValue("null"),
            ]

            for (const [DiscordID, agentInfos] of Object.entries(G6.data.agents)) {
                conducteurList.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(agentInfos.code_agent)
                        .setDescription(`${agentInfos.prenom} ${agentInfos.nom}`)
                        .setDefault(G6.data.missions[interaction.values[0]].conducteur === DiscordID)
                        .setValue(DiscordID),
                )

                agent2List.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(agentInfos.code_agent)
                        .setDescription(`${agentInfos.prenom} ${agentInfos.nom}`)
                        .setDefault(G6.data.missions[interaction.values[0]].agent2 === DiscordID)
                        .setValue(DiscordID),
                )

                agent3List.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(agentInfos.code_agent)
                        .setDescription(`${agentInfos.prenom} ${agentInfos.nom}`)
                        .setDefault(G6.data.missions[interaction.values[0]].agent3 === DiscordID)
                        .setValue(DiscordID),
                )

                agent4List.push(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(agentInfos.code_agent)
                        .setDescription(`${agentInfos.prenom} ${agentInfos.nom}`)
                        .setDefault(G6.data.missions[interaction.values[0]].agent4 === DiscordID)
                        .setValue(DiscordID),
                )
            }

            const conducteur = new StringSelectMenuBuilder()
                .setCustomId('conducteur')
                .setPlaceholder('Conducteur')
                .setRequired(true)
                .addOptions(...conducteurList);

            const agent2 = new StringSelectMenuBuilder()
                .setCustomId('agent2')
                .setPlaceholder('Deuxième agent')
                .setRequired(false)
                .addOptions(...agent2List);

            const agent3 = new StringSelectMenuBuilder()
                .setCustomId('agent3')
                .setPlaceholder('Troisième agent')
                .setRequired(false)
                .addOptions(...agent3List);

            const agent4 = new StringSelectMenuBuilder()
                .setCustomId('agent4')
                .setPlaceholder('Quatrième agent')
                .setRequired(false)
                .addOptions(...agent4List);

            agentModal.addLabelComponents([
                new LabelBuilder()
                    .setLabel('Conducteur')
                    .setStringSelectMenuComponent(conducteur),
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
        } else if (interaction.customId.split("_")[1] === "endservice") {
            const oldMission = G6.data.missions[interaction.values[0]]
            delete G6.data.missions[interaction.values[0]]

            G6.utils.saveData()

            G6.utils.updateService(interaction.user.id)
            G6.utils.serviceLogs(oldMission, interaction.values[0], interaction.user.id)


            interaction.reply({ content: "Mission terminée !", flags: MessageFlags.Ephemeral })
        }
    }
}