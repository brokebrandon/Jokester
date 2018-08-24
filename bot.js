// Initialize JSON object containing private things
const config = require('./config.json');

// Set up Discord client
const Discord = require('discord.js');
const client = new Discord.Client();

// Set up connection to jokes database
const db = require('sqlite');
db.open(`./${config.db.name}`);

//rateReminder appended at end of some messages
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
			if(args[0] != 'joke') {
				db.all(`SELECT * FROM jokes where category='${args[0]}'`)
				.then(row => {
					let joke_id = Math.floor(Math.random() * (row.length - 1 + 1));
					rateReminder = `\n\n😆 (${row[joke_id].upvotes})  😦 (${row[joke_id].downvotes})`;
					message.reply(`**${row[joke_id].joke}**${rateReminder}`)
				})
				.catch(error => {
					console.log(error);
				});
				break;
			}

			db.all(`SELECT * FROM jokes`)
			.then(row => {
				let joke_id = Math.floor(Math.random() * (row.length - 1 + 1));
				rateReminder = `\n\n😆 (${row[joke_id].upvotes})  😦 (${row[joke_id].downvotes})`;
				message.reply(`**${row[joke_id].joke}**${rateReminder}`)
			})
			.catch(error => {
				console.log(error);
			});

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
					rateReminder = `\n\n😆 (${row.upvotes})  😦 (${row.downvotes})`;
					reaction.message.edit(`**${joke}**${rateReminder}`);
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
					rateReminder = `\n\n😆 (${row.upvotes})  😦 (${row.downvotes})`;
					reaction.message.edit(`**${joke}**${rateReminder}`);
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
					rateReminder = `\n\n😆 (${row.upvotes})  😦 (${row.downvotes})`;
					reaction.message.edit(`**${joke}**${rateReminder}`);
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
					rateReminder = `\n\n😆 (${row.upvotes})  😦 (${row.downvotes})`;
					reaction.message.edit(`**${joke}**${rateReminder}`);
				})
				.catch(error => {
					console.log(error);
				});

			break;
		default:
			break;
	}

});

client.login(config.bot.token);
