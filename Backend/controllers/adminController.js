const pool = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET; // fallback if env not set

// Admin Login
exports.loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the admin exists
        const admin = await pool.query('SELECT * FROM admin WHERE username = $1 and password = $2', [username, password]);
        if (admin.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ adminId: admin.rows[0].admin_id, role: admin.rows[0].role }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Create Bus Operator
exports.createBusOperator = async (req, res) => {
    try {
        const { name, contact_number, email, address, total_buses } = req.body;

        // Check if the bus operator already exists
        const operatorExists = await pool.query('SELECT * FROM bus_operators WHERE email = $1', [email]);
        if (operatorExists.rows.length > 0) {
            return res.status(400).json({ message: 'Bus operator email already exists' });
        }

        // Insert the new bus operator into the database
        const newOperator = await pool.query(
            'INSERT INTO bus_operators (name, contact_number, email, address, total_buses) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, contact_number, email, address, total_buses]
        );

        res.status(201).json({ message: 'Bus Operator created successfully', operator: newOperator.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Create Bus
exports.createBus = async (req, res) => {
    try {
        const { bus_number, bus_name, operator_id, total_seats } = req.body;

        // Check if the bus already exists
        const busExists = await pool.query('SELECT * FROM buses WHERE bus_number = $1', [bus_number]);
        if (busExists.rows.length > 0) {
            return res.status(400).json({ message: 'Bus number already exists' });
        }

        // Insert the new bus into the database
        const newBus = await pool.query(
            'INSERT INTO buses (bus_number, bus_name, operator_id, total_seats) VALUES ($1, $2, $3, $4) RETURNING *',
            [bus_number, bus_name, operator_id, total_seats]
        );

        res.status(201).json({ message: 'Bus created successfully', bus: newBus.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Update Bus
exports.updateBus = async (req, res) => {
    const { bus_id } = req.params;
    const { bus_number, bus_name, operator_id, total_seats, is_active } = req.body;

    try {
        // Check if the bus exists
        const busResult = await pool.query('SELECT * FROM buses WHERE bus_id = $1', [bus_id]);
        if (busResult.rows.length === 0) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // If bus_number is being updated, check if the new bus_number already exists
        if (bus_number) {
            const checkBusNumber = await pool.query(
                'SELECT * FROM buses WHERE bus_number = $1 AND bus_id != $2',
                [bus_number, bus_id]
            );
            if (checkBusNumber.rows.length > 0) {
                return res.status(400).json({ message: 'Bus number already exists with another bus.' });
            }
        }

        // Update bus fields
        const updatedBus = await pool.query(
            `UPDATE buses
            SET 
                bus_number = COALESCE($1, bus_number),
                bus_name = COALESCE($2, bus_name),
                operator_id = COALESCE($3, operator_id),
                total_seats = COALESCE($4, total_seats),
                is_active = COALESCE($5, is_active)
            WHERE bus_id = $6
            RETURNING *`,
            [bus_number, bus_name, operator_id, total_seats, is_active, bus_id]
        );

        res.status(200).json({ message: 'Bus updated successfully', bus: updatedBus.rows[0] });
    } catch (error) {
        console.error('Error updating bus:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Admin Delete Bus
exports.deleteBus = async (req, res) => {
    try {
        const { bus_id } = req.params;

        // Check if the bus exists
        const bus = await pool.query('SELECT * FROM buses WHERE bus_id = $1', [bus_id]);
        if (bus.rows.length === 0) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Delete the bus from the database
        await pool.query('DELETE FROM buses WHERE bus_id = $1', [bus_id]);

        res.json({ message: 'Bus deleted successfully' });
    } catch (error) {
        console.error('Error deleting bus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
