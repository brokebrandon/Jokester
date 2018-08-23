// Initialize JSON object containing private things
const config = require('./config.json');

// Set up Discord client
const Discord = require('discord.js');
const client = new Discord.Client();

// Set up connection to jokes database
const db = require('sqlite');
db.open(`./${config.db.name}`);

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

	switch(command) {
		case `${config.bot.prefix}ping`:
			const m = await message.channel.send('Calculating ping...');
			m.delete();

			message.reply(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
			break;
		case `${config.bot.prefix}tellmea`:
			db.all(`SELECT * FROM jokes where category='${args[0]}'`)
				.then(row => {
					let id = Math.floor(Math.random() * (row.length - 1 + 1));
					message.reply(row[id].joke);
				})
				.catch(error => {
					console.log(error);
				});
			break;
		default:
			break;
	}

});

client.on('messageReactionAdd', reaction => {
	if(message.author.id == config.bot.id) {
		// TODO: handle reactions to jokes
		console.log(reaction);
	}
});

client.login(config.bot.token);
