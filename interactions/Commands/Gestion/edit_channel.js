const { MessageFlags, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit_channel')
        .setDescription("Modifier le channel pour chaque fonction")
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Quel salon voulez-vous modifier ?')
                .setRequired(true)
                .addChoices(
                    { name: 'Gestion (Message de gestion)', value: 'gestion' },
                    { name: 'Service (Notifications de service)', value: 'service' },
                    { name: 'Armement (Notification d\'armement', value: 'weapons' },
                ),
        )
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Donnez le nouveau salon')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_MESSAGES),
    async execute(interaction) {
        if (interaction.guild.id !== process.env.GUILD_ID) return;

        await interaction.deferReply({ content: "En cours de chargement..", flags: MessageFlags.Ephemeral })

        const type = interaction.options.getString('type');
        const channel = interaction.options.getChannel('salon');

        G6.data.channels[type] = channel.id
        G6.channels[type] = channel

        G6.utils.saveData()

        await interaction.editReply({ content: "Salon modifié", flags: MessageFlags.Ephemeral })
    }
}