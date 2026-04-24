const fs = require('fs');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const myArgs = process.argv.slice(2);

global.__basedir = __dirname;
global.G6 = require('./G6');

console.log("Launching in " + "\x1b[34mproduction\x1b[0m" + " mode\n")

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

process.on('SIGTERM', async () => {
  console.log('Arrêt..');
  await client.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Arrêt..');
  await client.destroy();
  process.exit(0);
});


client.login(process.env.DISCORD_TOKEN)