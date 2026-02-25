const fs = require("fs");

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    type: "clientReady",
    once: true,
    async callback() {
        const guild = await G6.client.guilds.cache.get(process.env.GUILD_ID)

        while (!G6.data) {
            console.log("En attente du data")
            await sleep(500)
        }

        let interactionNbr = 0
        fs.readdirSync(__basedir + '/interactions').forEach(typeDir => {
            fs.readdirSync(__basedir + '/interactions/' + typeDir).forEach(dir => {
                fs.readdirSync( __basedir + `/interactions/${typeDir}/${dir}`).filter(file => file.endsWith('.js')).forEach(file => {
                    const command = require(__basedir + `/interactions/${typeDir}/${dir}/${file}`);

                    if ('data' in command) {
                        let commandData = command.data.toJSON()
                        G6.commands[commandData.name] = {"dir": dir, "cmd": command}
                        interactionNbr++
                    } else {
                       console.log(`La commande de type ${typeDir} ${dir}/${file} n'a pas la propriété data.`)
                    }
                });
            });
        });

        G6.guild = guild
        if (!G6.data.channels.gestion || !G6.data.channels.gestion || !G6.data.channels.gestion) console.log("Erreur : Salon non définie")

        G6.channels.gestion = await guild.channels.cache.get(G6.data.channels.gestion)
        G6.channels.service = await guild.channels.cache.get(G6.data.channels.service)
        G6.channels.weapons = await guild.channels.cache.get(G6.data.channels.weapons)



        console.log("\x1b[32m[Connecté]" + " \x1b[34mDiscord \x1b[0m")
        console.log("\x1b[34m[Interaction]" + `\x1b[0m Chargement de \x1b[34m${interactionNbr}\x1b[0m interactions \x1b[0m`)

        //await G6.utils.registerCommands()
    }
}