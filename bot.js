const botconfig = require('./botconfig.json');
const Discord = require('discord.js');
const client = new Discord.Client();

//Get the Jokester ready for action
client.on('ready', () => {
	console.log(`${client.user.username} is now online.`);
	console.log(`Serving ${client.users.size} users.`);

	client.user.setActivity('Joke Simulator');

});

//React to messages
client.on('message', async message => {
	//if a bot triggers Jokester, ignore it
	if(message.author.bot) return;
	//if message doesn't start with prefix, ignore it
	if(message.content.indexOf(botconfig.prefix) !== 0) return;

	let messageArray = message.content.toLowerCase().split(' ');
	const command = messageArray[0];
	const args = messageArray.slice(1);

	if(command === `${botconfig.prefix}ping`) {
		const m = await message.channel.send('Calculating ping...');
		m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
	}

});

client.login(botconfig.token);
