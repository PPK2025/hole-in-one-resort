const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const session = require('express-session');

const db = new sqlite3.Database('./holeinone.db');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS options for allowing requests from your frontend
const corsOptions = {
    origin: [
        'http://127.0.0.1:5000',
        'http://localhost:5000',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Session middleware
app.use(session({
    secret: 'your_secret_key', // Change this in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Create 'inquiries' table with 'status' column for inquiries
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            status TEXT DEFAULT 'Pending Reply',
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
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
        )
    `);
});

// Admin login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        req.session.isAdmin = true;
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Admin logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Logged out' });
});

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized' });
    }
}

// Protected routes
app.get('/inquiries', requireAdmin, (req, res) => {
    db.all("SELECT * FROM inquiries", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching inquiries', error: err });
        }
        res.status(200).json({ inquiries: rows });
    });
});

app.get('/bookings', requireAdmin, (req, res) => {
    console.log('Fetching bookings...');
    db.all('SELECT * FROM bookings ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ bookings: rows });
    });
});

// Route for inquiry form submission (save inquiry to database)
app.post('/inquiry', (req, res) => {
    // Accept both 'fullName' and 'name' for compatibility
    const fullName = req.body.fullName || req.body.name;
    const { email, message, status } = req.body;

    // Insert inquiry into SQLite database with status
    const stmt = db.prepare("INSERT INTO inquiries (name, email, message, status) VALUES (?, ?, ?, ?)");
    stmt.run(fullName, email, message, status || 'Pending Reply', (err) => {  // Default status to 'Pending Reply'
        if (err) {
            return res.status(500).json({ message: 'Error saving inquiry to database', error: err });
        }
        res.status(200).json({ message: 'Inquiry submitted successfully' });
    });

    stmt.finalize();
});

// Route for handling booking form submission (save booking to database)
app.post('/book', (req, res) => {
    console.log('BODY:', req.body); // Debug log
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'No data received in request body' });
    }
    const { fullName, address, email, phoneNumber, fromDate, toDate, coursePackage, guests, paymentInfo } = req.body;

    // Calculate base amount based on the course/package
    let baseAmount = 0;
    if (coursePackage === 'Sea View Course') {
        baseAmount = 300;
    } else if (coursePackage === 'Other Course 1') {
        baseAmount = 200;
    } else if (coursePackage === 'Other Course 2') {
        baseAmount = 100;
    } else if (coursePackage === 'Five Rounds Package') {
        baseAmount = 800;
    } else if (coursePackage === 'Getaway Break Package') {
        baseAmount = 500;
    }

    // Calculate days difference between fromDate and toDate
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    const timeDifference = toDateObj - fromDateObj; // Difference in milliseconds
    const daysDifference = timeDifference / (1000 * 3600 * 24); // Convert milliseconds to days

    // Calculate total amount based on guests and number of days
    let totalAmount = baseAmount * guests * (daysDifference > 0 ? daysDifference : 1); // Avoid multiplying for 0 days

    console.log(`Total Amount Calculated: $${totalAmount}`);  // Log the calculated total amount

    // Insert booking into SQLite database
    const stmt = db.prepare("INSERT INTO bookings (fullName, address, email, phoneNumber, fromDate, toDate, coursePackage, guests, paymentInfo, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(fullName, address, email, phoneNumber, fromDate, toDate, coursePackage, guests, paymentInfo, totalAmount, (err) => {
        if (err) {
            return res.status(500).send('Error saving booking to database');
        }
        res.status(200).json({ message: 'Booking confirmed successfully', totalAmount });
    });

    stmt.finalize();
});

// DELETE inquiry by id
app.delete('/inquiries/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM inquiries WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting inquiry', error: err });
        }
        res.status(200).json({ message: 'Inquiry deleted successfully' });
    });
});

// DELETE booking by id
app.delete('/bookings/:id', requireAdmin, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting booking', error: err });
        }
        res.status(200).json({ message: 'Booking deleted successfully' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
