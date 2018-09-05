// Set up Discord client
const Discord = require('discord.js');
const client = new Discord.Client({disableEveryone: true});

// Initialize JSON object containing private things
const config = require('./config.json');

// Set up connection to database
const mysql = require('mysql');
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
	let messageArray = message.content.split(' ');
	const command = messageArray[0].toLowerCase();
	const args = messageArray.slice(1);

	let commandfile = client.commands.get(command.slice(prefix.length));
	if(commandfile) commandfile.run(client, message, args, db);
});

client.on('messageReactionAdd', (reaction, user) => {
	if(reaction.message.author.id != config.bot.id) {
		return;
	}

	let jokeArray = reaction.message.content.split('**');
	let joke = mysql.escape(jokeArray[1]);

	switch(reaction.emoji.name) {
		case '😆':
			sql = `UPDATE jokes SET upvotes = upvotes + 1 WHERE joke=${joke}`;
			db.query(sql, err => {
				if(err) throw err;
			});

			sql = `UPDATE user SET upvotes = upvotes + 1 WHERE user_id='${user.id}'`;
			db.query(sql, err => {
				if(err) throw err;
			});

			db.query(`SELECT * FROM jokes where joke=${joke}`, (err, row) => {
				row = row[0];
				let discordUser = client.users.get(row.user_id);
				let user = discordUser.username;
				let discriminator = discordUser.discriminator;

				let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
				rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

				reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
			});

			break;
		case '😦':
			sql = `UPDATE jokes SET downvotes = downvotes + 1 WHERE joke=${joke}`;
			db.query(sql, error => {
				console.log(error);
			});

			sql = `UPDATE user SET downvotes = downvotes + 1 WHERE user_id='${user.id}'`;
			db.query(sql, error => {
				console.log(error);
			});

			db.query(`SELECT * FROM jokes where joke=${joke}`, (err, row) => {
				row = row[0];
				let discordUser = client.users.get(row.user_id);
				let user = discordUser.username;
				let discriminator = discordUser.discriminator;

				let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
				rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

				reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
			});

			break;
		default:
			break;
	}

});


client.on('messageReactionRemove', (reaction, user) => {
	if(reaction.message.author.id != config.bot.id) {
		return;
	}

	let jokeArray = reaction.message.content.split('**');
	let joke = mysql.escape(jokeArray[1]);

	switch(reaction.emoji.name) {
		case '😆':
			sql = `UPDATE jokes SET upvotes = upvotes - 1 WHERE joke=${joke}`;
			db.query(sql, err => {
				if(err) throw err;
			});

			sql = `UPDATE user SET upvotes = upvotes - 1 WHERE user_id='${user.id}'`;
			db.query(sql, err => {
				if(err) throw err;
			});

			db.query(`SELECT * FROM jokes where joke=${joke}`, (err, row) => {
				row = row[0];
				let discordUser = client.users.get(row.user_id);
				let user = discordUser.username;
				let discriminator = discordUser.discriminator;

				let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
				rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

				reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
			});

			break;
		case '😦':
			sql = `UPDATE jokes SET downvotes = downvotes - 1 WHERE joke=${joke}`;
			db.query(sql, err => {
				if(err) throw err;
			});

			sql = `UPDATE user SET downvotes = downvotes - 1 WHERE user_id='${user.id}'`;
			db.query(sql, error => {
				if(err) throw err;
			});

			db.query(`SELECT * FROM jokes where joke=${joke}`, (err, row) => {
				row = row[0];
				let discordUser = client.users.get(row.user_id);
				let user = discordUser.username;
				let discriminator = discordUser.discriminator;

				let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
				rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

				reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
			});

			break;
		default:
			break;
	}

});

client.login(config.bot.token);
