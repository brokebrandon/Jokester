const Discord = require('discord.js');
const mysql = require('mysql');

module.exports.run = async (client, message, args, db) => {
	let sql;
	let cat = args[0].toLowerCase();
	
	switch(cat) {
		case 'joke':
			sql = `SELECT * FROM jokes`;
			break;
		default:
			sql = `SELECT * FROM jokes WHERE category=${mysql.escape(cat)}`;
			break;
	}

	db.query(sql, (error, rows) => {
		let joke_id = Math.floor(Math.random() * (rows.length - 1 + 1));
		let joke = rows[joke_id];

		let discordUser = client.users.get(joke.user_id);
		let user = discordUser.username;
		let discriminator = discordUser.discriminator;

		let userLine = `\n________________\n*submitted by ${user}#${discriminator}*`;
		let rateReminder = `\n😆 (${joke.upvotes})  😦 (${joke.downvotes})`;

		message.reply(`**${joke.joke}**${userLine}${rateReminder}`);
	});
}

module.exports.help = {
	name: 'tellmea'
}
