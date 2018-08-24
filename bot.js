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
			let sql;
			if(args[0] != 'joke') {

				// TODO: figure out how to emulate full outer join with sqlite
				// sql = `SELECT jokes.*, user.*
				// 				FROM jokes
				// 				LEFT JOIN user USING(user_id)
				// 				UNION ALL
				// 				SELECT jokes.*,
				// 							 user.*
				// 				FROM user
				// 				LEFT JOIN jokes USING(user_id)
				// 				WHERE jokes.user_id IS NULL`;

				sql = `SELECT * FROM jokes WHERE category='${args[0]}'`;
				sendJoke(sql, message);

				break;
			}

			sql = `SELECT * FROM jokes`
			sendJoke(sql, message);

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
				.catch();

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


async function sendJoke(sql, message) {
	db.all(sql)
	.then(row => {

		// TODO: Implement this code once full outer join with sqlite is figured out
		// let discordUser = client.users.get(user_id.toString());
		// let user = JSON.stringify({
		// 	id:`${row.user_id}`,
		// 	name:`${discordUser.username}`,
		// 	discriminator:`${discordUser.discriminator}`,
		// 	upvotes:`${row.upvotes}`,
		// 	downvotes:`${row.downvotes}`,
		// 	score:`${row.upvotes} - ${row.downvotes} < 0 ? 0 : value`
		// });
		// let userLine = `\n*submitted by ${user.username}${user.discriminator} (${user.score})*`

		let joke_id = Math.floor(Math.random() * (row.length - 1 + 1));
		rateReminder = `\n\n😆 (${row[joke_id].upvotes})  😦 (${row[joke_id].downvotes})`;
		message.reply(`**${row[joke_id].joke}**${rateReminder}`); //${userLine}
	})
	.catch(error => {
		console.log(error);
	});
}

client.login(config.bot.token);
