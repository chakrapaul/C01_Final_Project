const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;
const jwtSecret = 'your_jwt_secret'; // Keep secure in production

// ✅ MySQL Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Prince#789',
  database: 'uncc_project',
};

// ✅ Login using MySQL users table
app.post('/login', async (req, res) => {
  const { user, pass } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [user, pass]
    );

    if (rows.length > 0) {
      const token = jwt.sign({ user }, jwtSecret, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(403).json({ message: 'Incorrect username or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) await connection.end();
  }
});

// ✅ JWT Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// ✅ Summary Endpoint (protected)
app.get('/summary', authenticateJWT, async (req, res) => {
  const summary = {
    title: 'Niner Nation Gives 2025',
    content:
      'UNC Charlotte set a record during the 10th anniversary of Niner Nation Gives, raising more than $4.9 million during the 49-hour giving campaign. Alumni, students, faculty, staff, families, and friends contributed more than 6,600 gifts during the April 8-10 event, making it the most successful Niner Nation Gives in University history. Niner Nation Gives is Charlotte’s annual digital fundraising event that brings together students, alumni, faculty, staff, and University friends to support scholarships, programs, faculty, and departments across the University. During this year’s Niner Nation Gives, Bo ’99 and Angie Cauble announced a $2 million gift to support the University’s historic For the Love of Charlotte campaign...',
    source:
      'https://inside.charlotte.edu/2025/04/30/niner-nation-gives-2025-a-record-breaking-celebration-of-generosity/',
  };
  res.json(summary);
});

// ✅ Report Endpoint (protected)
app.get('/report', authenticateJWT, async (req, res) => {
  const reportData = {
    chart1: {
      title: 'Total Donations Over Time',
      data: [
        { date: '2025-04-08', amount: 1000000 },
        { date: '2025-04-09', amount: 2000000 },
        { date: '2025-04-10', amount: 1900000 },
      ],
    },
    chart2: {
      title: 'Donation Distribution by Category',
      data: [
        { category: 'Scholarships', amount: 1500000 },
        { category: 'Academic Programs', amount: 1200000 },
        { category: 'Athletics', amount: 800000 },
        { category: 'Other', amount: 1500000 },
      ],
    },
  };
  res.json(reportData);
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`API served at http://localhost:${port}`);
});
