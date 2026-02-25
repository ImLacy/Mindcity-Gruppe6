const { MessageFlags, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send_gestion_msg')
        .setDescription("Permets d'envoyer le message de gestion du service, armement, etc")
        .setDefaultMemberPermissions(PermissionFlagsBits.MANAGE_MESSAGES),
    async execute(interaction) {
        if (interaction.guild.id !== process.env.GUILD_ID) return;

        await interaction.deferReply({ content: "En cours de chargement..", flags: MessageFlags.Ephemeral })

        const serviceEmbed = new EmbedBuilder()
            .setColor("#1d7b25")
            .setTitle('Service')
            .setTimestamp()

        const weaponEmbed = new EmbedBuilder()
            .setColor("#1d7b25")
            .setTitle('Armement')
            .setTimestamp()
            .setFooter({ text: 'Aucune modification effectué' });

        const startBtn = new ButtonBuilder().setCustomId('gestion_newservice').setLabel('Nouvelle mission').setStyle(ButtonStyle.Primary);
        const editBtn = new ButtonBuilder().setCustomId('gestion_editservice').setLabel('Modifier une mission').setStyle(ButtonStyle.Secondary);
        const endBtn = new ButtonBuilder().setCustomId('gestion_endservice').setLabel('Finir une mission').setStyle(ButtonStyle.Danger);

        const serviceRow = new ActionRowBuilder().addComponents(startBtn, editBtn, endBtn);

        const weaponBtn = new ButtonBuilder().setCustomId('gestion_weapon').setLabel('Modifier mon armement').setStyle(ButtonStyle.Primary);
        const weaponRow = new ActionRowBuilder().addComponents(weaponBtn);

        const serviceMessage = await G6.channels.gestion.send({embeds: [serviceEmbed], components: [serviceRow]})
        const weaponMessage = await G6.channels.gestion.send({embeds: [weaponEmbed], components: [weaponRow]})

        G6.data.service_msgid = serviceMessage.id
        G6.data.weapon_msgid = weaponMessage.id

        G6.utils.saveData()

        await interaction.editReply({ content: "Message envoyé.", flags: MessageFlags.Ephemeral })
    }
}