const fs = require('fs');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const myArgs = process.argv.slice(2);

global.__basedir = __dirname;
global.G6 = require('./G6');

if (myArgs.length > 0 && myArgs[0] === "dev") {
    global.G6 = require('./G6/dev');
    G6.dev = true
    console.log("Launching in " + "\x1b[32mdeveloper\x1b[0m" + " mode\n")
} else {
    G6.dev = false
    console.log("Launching in " + "\x1b[34mproduction\x1b[0m" + " mode\n")
}

process.on('uncaughtException', function (err) {
    console.error(err);
});

G6.client = client;
G6.commands = new Collection()
G6.channels = {}

// Enregistrement des events
fs.readdirSync('events').forEach(file => {
    const event = require(`./events/${file}`);
    if(event.once) client.once(event.type, event.callback.bind(event));
    else client.on(event.type, event.callback.bind(event));
});

client.login(process.env.DISCORD_TOKEN)