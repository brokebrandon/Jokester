// Initialize JSON object containing private things
const config = require('../config.json');

// Set up connection to jokes database
const mysql = require('mysql');

const db = mysql.createConnection({
	host:config.db.host,
	user:config.db.user,
	password:config.db.pass,
	database:config.db.name
});

db.connect(err => {
	console.log(`Successfully connected to database: ${config.db.name}`);
});

db.on('error', err => {
    console.log(err.code);
});

module.exports = db;
