const pool = require('../db');

// Search buses based on source, destination, and date
exports.searchBuses = async (req, res) => {
    try {
        const { source, destination, date } = req.query;

        if (!source || !destination || !date) {
            return res.status(400).json({ message: 'Source, destination, and date are required' });
        }

        const buses = await pool.query(
            `SELECT bs.schedule_id, b.bus_name, b.bus_number, bo.name AS operator_name,
                    l1.name AS source, l2.name AS destination, 
                    bs.departure_time, bs.arrival_time
             FROM bus_schedules bs
             JOIN buses b ON bs.bus_id = b.bus_id
             JOIN bus_operators bo ON b.operator_id = bo.operator_id
             JOIN routes r ON bs.route_id = r.route_id
             JOIN locations l1 ON r.start_location_id = l1.location_id
             JOIN locations l2 ON r.end_location_id = l2.location_id
             WHERE l1.name = $1 AND l2.name = $2 AND bs.departure_date = $3`,
            [source, destination, date]
        );

        res.json(buses.rows);
    } catch (error) {
        console.error('Error searching buses:', error.message);
        res.status(500).json({ message: 'Failed to search buses' });
    }
};

// View available seats for a schedule
exports.getAvailableSeats = async (req, res) => {
    try {
        const { scheduleId } = req.params;

        if (!scheduleId) {
            return res.status(400).json({ message: 'Schedule ID is required' });
        }

        // Get bus ID for the schedule
        const busIdResult = await pool.query(
            'SELECT bus_id FROM bus_schedules WHERE schedule_id = $1',
            [scheduleId]
        );

        const busId = busIdResult.rows[0]?.bus_id;
        if (!busId) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        // Fetch all seats of the bus
        const allSeats = await pool.query(
            'SELECT seat_number FROM bus_seats WHERE bus_id = $1',
            [busId]
        );

        // Fetch booked seats for the schedule
        const bookedSeats = await pool.query(
            `SELECT seat_number FROM bookings 
             WHERE schedule_id = $1 AND status = 'Booked'`,
            [scheduleId]
        );

        const bookedSet = new Set(bookedSeats.rows.map(seat => seat.seat_number));

        // Get available seat numbers
        const availableSeats = allSeats.rows
            .map(seat => seat.seat_number)
            .filter(seatNum => !bookedSet.has(seatNum));

        res.json({ availableSeats });
    } catch (error) {
        console.error('Error fetching available seats:', error.message);
        res.status(500).json({ message: 'Failed to fetch available seats' });
    }
};
