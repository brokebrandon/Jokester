// Set up Discord client
const Discord = require('discord.js');
const client = new Discord.Client({disableEveryone: true});

// Initialize JSON object containing private things
const config = require('./config.json');

// Set up connection to database
const db = require('./database/connect.js');

// Used for command handler - reads files in ./commands/
const fs = require('fs');
client.commands = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
	let commandFiles = files.filter(f => f.split('.').pop() === 'js');
	if(commandFiles.length <= 0) {
		console.log('No commands have been loaded');
		return;
	}

	commandFiles.forEach((f, i) => {
		let command = require(`./commands/${f}`);
		client.commands.set(command.help.name, command);
		console.log(`${f} loaded`);
	});
});


// Get the Jokester ready for action
client.on('ready', () => {
	console.log(`${client.user.username} is now online.`);
	console.log(`Serving ${client.users.size} users.`);
	client.user.setActivity('Joke Simulator');
});


// React to messages
client.on('message', async message => {
	// if a bot triggers Jokester, ignore it
	if(message.author.bot) return;
	// if message doesn't start with prefix, ignore it
	if(message.content.indexOf(config.bot.prefix) !== 0) return;

	let prefix = config.bot.prefix;
	let messageArray = message.content.toLowerCase().split(' ');
	const command = messageArray[0];
	const args = messageArray.slice(1);

	let commandfile = client.commands.get(command.slice(prefix.length));
	if(commandfile) commandfile.run(client, message, args, db);
});

client.login(config.bot.token);
