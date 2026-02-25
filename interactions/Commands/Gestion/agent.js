const { MessageFlags, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gestion_agents')
        .setDescription('Ajouter, modifier et supprimer des agents')
        .setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_MESSAGES)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ajouter')
                .setDescription('Ajouter ou modifier un agent')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription("Indiquez le compte Discord de l'agent")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('prenom')
                        .setDescription('Donnez le prénom')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Donnez le prénom')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('code_agent')
                        .setDescription('Donnez le code agent')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('retirer')
                .setDescription('Retirer un agent')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription("Mentionnez l'agent")
                        .setRequired(true))),
    async execute(interaction) {
        if (interaction.guild.id !== process.env.GUILD_ID) return;

        await interaction.deferReply({ content: "En cours de chargement..", flags: MessageFlags.Ephemeral })

        if (interaction.options._subcommand === "ajouter") {


            G6.data.agents[interaction.options.getUser('membre').id] = {
                "prenom": interaction.options.getString('prenom'),
                "nom": interaction.options.getString('nom'),
                "code_agent": interaction.options.getString('code_agent'),
                "armement" : {
                    "armeLourde": "",
                    "armeLegere": "",
                    "taser": ""
                }
            }

            G6.utils.saveData()

            return await interaction.editReply({ content: "Agent ajouté/modifié avec succès", flags: MessageFlags.Ephemeral })
        } else if (interaction.options._subcommand === "retirer") {
            delete G6.data.agents[interaction.options.getUser('membre').id]

            G6.utils.saveData()

            return await interaction.editReply({ content: "Agent supprimé avec succès", flags: MessageFlags.Ephemeral })
        }

        await interaction.editReply({ content: "Impossible de comprendre la commande, merci de contacter Lacy.", flags: MessageFlags.Ephemeral })
    },
}