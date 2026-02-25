module.exports = {
    type: "interactionCreate",
    async callback(interaction) {
        if (interaction.guildId) {
            if (interaction.guildId !== process.env.GUILD_ID) return;

            if (interaction.isCommand()) {
                const commandName = interaction.commandName
                const command = G6.commands[commandName]

                await command.cmd.execute(interaction)
            }

            if (interaction.isStringSelectMenu()) {
                if (interaction.customId.split("_").length === 1) {
                    // On execute la commande
                    // Exemple : Bouton avec l'ID valorant execute la commande "valorant"
                    const commandName = interaction.customId.split(" ")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.execute(interaction)
                } else {
                    const commandName = interaction.customId.split("_")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.select(interaction)
                }
            }

            if (interaction.isButton()){
                if (interaction.customId.split("_").length === 1) {
                    // On execute la commande
                    // Exemple : Bouton avec l'ID valorant execute la commande "valorant"
                    const commandName = interaction.customId.split(" ")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.execute(interaction)
                } else {
                    const commandName = interaction.customId.split("_")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.button(interaction)
                }
            }

            if (interaction.isModalSubmit()) {
                const commandName = interaction.customId.split("_")[0]
                const command = G6.commands[commandName]

                await command.cmd.modal(interaction)
            }
        } else {
            if (interaction.isButton()){
                if (interaction.customId.split("_").length === 1) {
                    // On execute la commande
                    // Exemple : Bouton avec l'ID valorant execute la commande "valorant"
                    const commandName = interaction.customId.split(" ")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.execute(interaction)
                } else {
                    const commandName = interaction.customId.split("_")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.button(interaction)
                }
            }

            if (interaction.isStringSelectMenu()) {
                if (interaction.customId.split("_").length === 1) {
                    // On execute la commande
                    // Exemple : Bouton avec l'ID valorant execute la commande "valorant"
                    const commandName = interaction.customId.split(" ")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.execute(interaction)
                } else {
                    const commandName = interaction.customId.split("_")[0]
                    const command = G6.commands[commandName]

                    await command.cmd.select(interaction)
                }
            }

            if (interaction.isModalSubmit()) {
                const commandName = interaction.customId.split("_")[0]
                const command = G6.commands[commandName]

                await command.cmd.modal(interaction)
            }
        }
    }
}