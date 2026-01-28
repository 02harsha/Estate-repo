const mysql = require("mysql2");

// Create connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "your_database"
});

// Connect
db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully!");
  }
});

module.exports = db;
