const config = require('../config.json');
const Discord = require('discord.js');

const db = require('sqlite');
db.open(`./${config.db.name}`);

modules.exports.run async (bot, message, args) {
	let sql;

	switch(args[0]) {
		case 'joke':
			sql = `SELECT * FROM jokes`;
			break;
		default:
			sql = `SELECT * FROM jokes WHERE category='${args[0]}'`;
			break;
	}

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
