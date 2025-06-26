const express = require('express');
const cors = require('cors');
const {Pool} = require('pg');
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user : 'postgres',
    host : 'localhost',
    database : 'Bus_Ticket_Booker',
    password : '!@#$%^&*()_+',
    port : 5432
})

module.exports = pool;
