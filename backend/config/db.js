const mysql = require('mysql2/promise');
require('dotenv').config();

// Acepta tanto la convención propia del proyecto (DB_HOST, DB_USER...) usada
// en desarrollo local, como la convención nativa que Railway inyecta para su
// plugin de MySQL (MYSQLHOST, MYSQLUSER...) — así no hace falta duplicar
// variables al desplegar.
const host     = process.env.DB_HOST     || process.env.MYSQLHOST;
const port     = process.env.DB_PORT     || process.env.MYSQLPORT     || 3306;
const user     = process.env.DB_USER     || process.env.MYSQLUSER;
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
const database = process.env.DB_NAME     || process.env.MYSQLDATABASE;

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

module.exports = pool;