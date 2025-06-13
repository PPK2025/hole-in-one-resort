// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./holeinone.db');

// Create 'users' table for authentication if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    // Create 'inquiries' table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create 'bookings' table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
           fullName TEXT,
            address TEXT,
            email TEXT,
            phoneNumber TEXT,
            fromDate TEXT,
            toDate TEXT,
            coursePackage TEXT,
            guests INTEGER,
            totalAmount REAL,
            status TEXT DEFAULT 'Billed',
            paymentInfo TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;  // Export the database connection

