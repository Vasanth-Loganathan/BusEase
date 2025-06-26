const pool = require('../db');

// Create feedback
exports.createFeedback = async (req, res) => {
    try {
        const { booking_id, rating, comments } = req.body;
        const user_id = req.user.userId;

        const newFeedback = await pool.query(
            'INSERT INTO feedback (booking_id, user_id, rating, comments) VALUES ($1, $2, $3, $4) RETURNING *',
            [booking_id, user_id, rating, comments]
        );

        res.status(201).json({ message: 'Feedback given successfully', feedback: newFeedback.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get feedback for a booking
exports.getFeedback = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const feedbacks = await pool.query(
            'SELECT * FROM feedback WHERE booking_id = $1',
            [booking_id]
        );

        if (feedbacks.rows.length > 0) {
            res.json(feedbacks.rows); // send all feedbacks if multiple exist
        } else {
            res.status(404).json({ message: 'No feedback found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
