// controllers/bookingController.js
const pool = require('../db');

exports.bookSeat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { scheduleId, startLocationId, endLocationId, selectedSeats } = req.body; // Renamed to selectedSeats for clarity
        if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            return res.status(400).json({ message: 'No seats selected for booking' });
        }

        const bookingConfirmationDetails = [];
        let bookingSuccessful = true;

        // Start a transaction to ensure atomicity of multiple bookings
        await pool.query('BEGIN');

        try {
            const scheduleDetailsForDate = await pool.query(
                'SELECT departure_date FROM bus_schedules WHERE schedule_id = $1',
                [scheduleId]
            );
            if (scheduleDetailsForDate.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Schedule not found' });
            }
            const travelDate = scheduleDetailsForDate.rows[0].departure_date;

            // Fetch fare amount (assuming the fare is the same for all seats in a booking)
            const priceResult = await pool.query(
                'SELECT fare_amount FROM prices WHERE schedule_id = $1',
                [scheduleId]
            );
            const fareAmount = priceResult.rows[0]?.fare_amount || 500.00;

            // Fetch bus details, operator, and location names (fetch once for all bookings in this request)
            const scheduleDetails = await pool.query(`
                SELECT
                    bs.departure_date,
                    bs.departure_time,
                    bs.arrival_time,
                    b.bus_name,
                    bo.name AS operator_name,
                    l1.name AS source_name,
                    l2.name AS destination_name
                FROM bus_schedules bs
                JOIN buses b ON bs.bus_id = b.bus_id
                JOIN bus_operators bo ON b.operator_id = bo.operator_id
                JOIN routes r ON bs.route_id = r.route_id
                JOIN locations l1 ON r.start_location_id = l1.location_id
                JOIN locations l2 ON r.end_location_id = l2.location_id
                WHERE bs.schedule_id = $1
            `, [scheduleId]);

            if (scheduleDetails.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Schedule not found' });
            }

            const { departure_date, departure_time, arrival_time, bus_name, operator_name, source_name, destination_name } = scheduleDetails.rows[0];

            for (const seatNumber of selectedSeats) {
                // Check if the seat is already booked for the specific travel date
                const existingBooking = await pool.query(
                    `SELECT * FROM bookings
                     WHERE schedule_id = $1 AND seat_number = $2 AND travel_date = $3`,
                    [scheduleId, seatNumber, travelDate]
                );

                if (existingBooking.rows.length > 0) {
                    await pool.query('ROLLBACK');
                    return res.status(400).json({ message: `Seat ${seatNumber} is already booked for this schedule and date` });
                }

                // Insert booking for the current seat
                const booking = await pool.query(
                    `INSERT INTO bookings (user_id, schedule_id, booking_date, travel_date, start_location_id, end_location_id, seat_number, total_amount)
                     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7)
                     RETURNING booking_id`,
                    [userId, scheduleId, departure_date, startLocationId, endLocationId, seatNumber, fareAmount]
                );

                bookingConfirmationDetails.push({
                    booking_id: booking.rows[0].booking_id,
                    seat_number: seatNumber,
                });
            }

            await pool.query('COMMIT');

            const responseData = {
                message: 'Booking successful for selected seats',
                bus_name: bus_name,
                operator_name: operator_name,
                source_name: source_name,
                destination_name: destination_name,
                departure_time: departure_time,
                arrival_time: arrival_time,
                selectedSeats: selectedSeats,
                total_amount: fareAmount * selectedSeats.length, // Calculate total amount
                user_id: userId,
                bookings: bookingConfirmationDetails, // Include details of individual bookings
            };

            res.status(201).json(responseData);

        } catch (transactionError) {
            await pool.query('ROLLBACK');
            console.error('Error during booking transaction:', transactionError.message);
            res.status(500).json({ message: 'Error booking seats' });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log("User ID:", userId); // Add this line to log the user ID

        const query = `
            SELECT
                b.booking_id,
                sl.name AS source,
                el.name AS destination,
                bs.departure_date,
                bs.departure_time,
                bs.arrival_time,
                b.seat_number,
                b.total_amount,
                b.status
            FROM bookings b
            JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
            JOIN locations sl ON b.start_location_id = sl.location_id
            JOIN locations el ON b.end_location_id = el.location_id
            WHERE b.user_id = $1
            ORDER BY bs.departure_date DESC, bs.departure_time DESC`;
        console.log("Query:", query); // Log the query

        const bookings = await pool.query(query, [userId]);
        console.log("Bookings:", bookings); // Log the query result

        res.status(200).json(bookings.rows); // Send bookings.rows instead of { bookings }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel upcoming booking and unbook the seat
exports.cancelBooking = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { bookingId } = req.params;

        // Check if the booking belongs to the logged-in user and is upcoming
        const bookingToCheck = await pool.query(
            `SELECT b.schedule_id, b.seat_number, bs.departure_date
             FROM bookings b
             JOIN bus_schedules bs ON b.schedule_id = bs.schedule_id
             WHERE b.booking_id = $1 AND b.user_id = $2 AND bs.departure_date >= CURRENT_DATE`,
            [bookingId, userId]
        );

        if (bookingToCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found or cannot be cancelled (already passed)' });
        }

        const { schedule_id, seat_number, departure_date } = bookingToCheck.rows[0];

        // Start a transaction to ensure atomicity
        await pool.query('BEGIN');

        try {
            // Update the booking status to 'Cancelled'
            const updatedBooking = await pool.query(
                `UPDATE bookings
                 SET status = 'Cancelled'
                 WHERE booking_id = $1 AND user_id = $2
                 RETURNING booking_id`,
                [bookingId, userId]
            );

            if (updatedBooking.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: 'Could not cancel the booking' });
            }

            await pool.query('COMMIT');
            res.json({ message: `Booking with ID ${bookingId} has been cancelled successfully` });

        } catch (transactionError) {
            await pool.query('ROLLBACK');
            console.error('Error during cancellation transaction:', transactionError.message);
            return res.status(500).json({ message: 'Error cancelling booking' });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};