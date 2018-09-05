const Discord = require('discord.js');
const mysql = require('mysql');

module.exports.run = async (bot, message, args, db) => {
	// TODO: code up this function so users can add jokes
	if(args.length < 6) {
		message.reply('Sorry, your joke is too short!');
		return;
	}

	let user_id = message.author.id;
	let category = mysql.escape(args[0]);
	let joke = mysql.escape(args.slice(1).join(' '));
	let sql = `INSERT INTO jokes (user_id, category, joke) VALUES ('${user_id}', ${category}, ${joke})`;

	db.query(sql, (err, rows) => {
		if(err) throw err;
		message.reply('Your joke has been added!');
	});
}

module.exports.help = {
	name: 'submit'
}
