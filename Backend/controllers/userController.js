const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key'; 

// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { name, email, password, phone, age, gender } = req.body;

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, phone, age, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, hashedPassword, phone, age, gender] // default role is 'User' if not given
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.rows[0].user_id }, // role included
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // updated path because now req.user contains userId and role

        const user = await pool.query(
            'SELECT name, email, phone, age, gender FROM users WHERE user_id = $1',
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, email, phone, age, gender } = req.body;

        // Check if the new email is already used by someone else
        const emailCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND user_id != $2',
            [email, userId]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use by another account' });
        }

        await pool.query(
            'UPDATE users SET name = $1, email = $2, phone = $3, age = $4, gender = $5 WHERE user_id = $6',
            [name, email, phone, age, gender, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
