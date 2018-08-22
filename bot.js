// Initialize JSON object containing private things
const config = require('./config.json');

// Set up Discord client
const Discord = require('discord.js');
const client = new Discord.Client();

// Set up connection to jokes database
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(`./${config.database.name}`, err => {
	if(err) {
		return console.log(err.message);
	}
	console.log(`Connected to ${config.database.name}`);

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

	let messageArray = message.content.toLowerCase().split(' ');
	const command = messageArray[0];
	const args = messageArray.slice(1);

	switch (command) {
		case `${config.bot.prefix}ping`:
			const m = await message.channel.send('Calculating ping...');
			m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
			break;
		case `${config.bot.prefix}tellmea`:
			console.log(args[0]);
			let joke = getJoke(args[0]);
			message.channel.send(joke);
			break;
		default:
			break;
	}

});

function getJoke(category){
	// TODO: get joke from database
}

client.login(config.bot.token);
