require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const PORT = 3000;

// In-memory user store (for demo only, use a DB in production)
const users = [];
// In-memory Google user store
const googleUsers = [];

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    let user = googleUsers.find(u => u.googleId === profile.id);
    if (!user) {
        user = {
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : ''
        };
        googleUsers.push(user);
    }
    return done(null, user);
}));

passport.serializeUser((user, done) => {
    done(null, user.googleId || user.username);
});
passport.deserializeUser((id, done) => {
    let user = googleUsers.find(u => u.googleId === id);
    if (!user) user = users.find(u => u.username === id);
    done(null, user);
});

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to main page
        res.redirect('/main?googleUser=' + encodeURIComponent(req.user.username));
    }
);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(409).json({ message: 'User already exists.' });
    }
    // In production, hash the password!
    users.push({ username, email, password });
    res.status(201).json({ message: 'User registered successfully.' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }
    res.json({ message: 'Login successful.' });
});



// Fallback: serve index.html for any unknown GET request (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
