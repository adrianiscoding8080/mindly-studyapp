const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// In-memory user database & active session tracking
const users = [];
let currentUser = null;

// --- Features API Route ---
app.get('/api/features', (req, res) => {
  const features = [
    {
      id: 1,
      icon: '⚡',
      title: 'Smart Spaced Repetition',
      description: 'Our algorithms calculate the exact moment you need to review material before you forget it.'
    },
    {
      id: 2,
      icon: '🔥',
      title: 'Study Streaks & Rewards',
      description: 'Stay motivated with daily streaks, level progression, and friendly student leaderboards.'
    },
    {
      id: 3,
      icon: '🎯',
      title: 'Deep Focus Mode',
      description: 'Integrated Pomodoro timers and ambient soundscapes designed to eliminate distractions.'
    }
  ];

  res.json(features);
});

// --- User Registration Route ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Save new user
    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);

    // Automatically log them in upon registration
    currentUser = username;

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// --- User Login Route ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare hashed passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Set active session
    currentUser = username;

    res.json({ message: 'Login successful!', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// --- Session Check Route ---
app.get('/api/check-session', (req, res) => {
  if (currentUser) {
    res.json({ loggedIn: true, username: currentUser });
  } else {
    res.status(401).json({ loggedIn: false, message: 'Unauthorized' });
  }
});

// --- User Logout Route ---
app.post('/api/logout', (req, res) => {
  currentUser = null;
  res.json({ message: 'Logged out successfully' });
});

// Serve index.html for root requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server (Must be at the bottom of the file)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});