// Initialize JSON object containing private things
const config = require('./config.json');

// Set up Discord client
const Discord = require('discord.js');
const client = new Discord.Client();

// Set up connection to database
const mysql = require('mysql');
const db = mysql.createConnection({
	host:config.db.host,
	user:config.db.user,
	password:config.db.pass,
	database:config.db.name
});
db.connect(err => {
	if(err) throw err;
	console.log(`Successfully connected to database: ${config.db.name}`);
});

// English dictionary
// TODO: add english dictionary

// used to compare submissions to existing jokes
var stringSimilarity = require('string-similarity');

// rateReminder appended at end of some messages
var rateReminder;

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

	switch(command) {
		case `${prefix}ping`:
			const m = await message.channel.send('Calculating ping...');
			m.delete();
			message.reply(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);

			break;
		case `${prefix}tellmea`:
			let sql;

			if(args[0] != 'joke') {
				sql = `SELECT * FROM jokes WHERE category='${args[0]}'`;
				sendJoke(sql, message);

				break;
			}

			sql = `SELECT * FROM jokes`
			sendJoke(sql, message);

			break;
			case `${prefix}submit`:
				addJoke(args, message);
				break;
		default:
			break;
	}
});


client.on('messageReactionAdd', (reaction, user) => {
	if(reaction.message.author.id != config.bot.id) {
		return;
	}

	let jokeArray = reaction.message.content.split('**');
	let joke = jokeArray[1];

	switch(reaction.emoji.name) {
		case '😆':
			sql = `UPDATE jokes SET upvotes = upvotes + 1 WHERE joke="${joke}"`;
			db.run(sql, error => {
				console.log(error);
			});

			sql = `UPDATE user SET upvotes = upvotes + 1 WHERE user_id="${user.id}"`;
			db.run(sql, error => {
				console.log(error);
			});

			db.get(`SELECT * FROM jokes where joke='${joke}'`)
				.then(row => {
					let discordUser = client.users.get(row.user_id.toString());
					let user = discordUser.username;
					let discriminator = discordUser.discriminator;

					let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
					rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

					reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
				})
				.catch(error => {
					console.log(error);
				});

			break;
		case '😦':
			sql = `UPDATE jokes SET downvotes = downvotes + 1 WHERE joke="${joke}"`;
			db.run(sql, error => {
				console.log(error);
			});

			sql = `UPDATE user SET downvotes = downvotes + 1 WHERE user_id="${user.id}"`;
			db.run(sql, error => {
				console.log(error);
			});

			db.get(`SELECT * FROM jokes where joke='${joke}'`)
				.then(row => {
					let discordUser = client.users.get(row.user_id.toString());
					let user = discordUser.username;
					let discriminator = discordUser.discriminator;

					let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
					rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

					reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
				})
				.catch(error => {
					console.log(error);
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
	let joke = jokeArray[1];

	switch(reaction.emoji.name) {
		case '😆':
			sql = `UPDATE jokes SET upvotes = upvotes - 1 WHERE joke="${joke}"`;
			db.run(sql, error => {
				console.log(error);
			});

			sql = `UPDATE user SET upvotes = upvotes - 1 WHERE user_id="${user.id}"`;
			db.run(sql, error => {
				console.log(error);
			});

			db.get(`SELECT * FROM jokes where joke='${joke}'`)
				.then(row => {
					let discordUser = client.users.get(row.user_id.toString());
					let user = discordUser.username;
					let discriminator = discordUser.discriminator;

					let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
					rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

					reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
				})
				.catch(error => {
					console.log(error);
				});

			break;
		case '😦':
			sql = `UPDATE jokes SET downvotes = downvotes - 1 WHERE joke="${joke}"`;
			db.run(sql, error => {
				console.log(error);
			});

			sql = `UPDATE user SET downvotes = downvotes - 1 WHERE user_id="${user.id}"`;
			db.run(sql, error => {
				console.log(error);
			});

			db.get(`SELECT * FROM jokes where joke='${joke}'`)
				.then(row => {
					let discordUser = client.users.get(row.user_id.toString());
					let user = discordUser.username;
					let discriminator = discordUser.discriminator;

					let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
					rateReminder = `\n😆 (${row.upvotes})  😦 (${row.downvotes})`;

					reaction.message.edit(`**${joke}**${userLine}${rateReminder}`);
				})
				.catch(error => {
					console.log(error);
				});

			break;
		default:
			break;
	}
});


async function addJoke(args, message) {
	// TODO: code up this function so users can add jokes
	// check joke length
	// check similarity of existing jokes
	if(args.length < 6) {
		message.reply('Sorry, your joke is too short!');
		return;
	}
}


async function sendJoke(sql, message) {
	db.all(sql)
	.then(row => {
		let joke_id = Math.floor(Math.random() * (row.length - 1 + 1));

		let discordUser = client.users.get(row[joke_id].user_id.toString());
		let user = discordUser.username;
		let discriminator = discordUser.discriminator;

		let joke = `${row[joke_id].joke}`;
		let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
		rateReminder = `\n😆 (${row[joke_id].upvotes})  😦 (${row[joke_id].downvotes})`;

		message.reply(`**${joke}**${userLine}${rateReminder}`);
	})
	.catch(error => {
		console.log(error);
	});
}

client.login(config.bot.token);
