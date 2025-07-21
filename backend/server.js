const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// FIRST load environment variables
dotenv.config();

// Then require rest
const db_connect = require('./utils/db');


// Middlewares
app.use(bodyParser.json());

// CORS Handling
const corsOptions = {
    origin: [
        "https://smriti-s-echo-admin-pq1n.vercel.app",
        "https://smriti-jha-userdashboard.onrender.com",
        "http://localhost:3000"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

if (process.env.NODE_ENV === 'production') {
    app.use(cors()); // Use wildcard in production
} else {
    app.use(cors(corsOptions));
}

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/PoetryRoute'));
app.use('/', require('./routes/querySubscribeRoute'));
app.use('/', require('./routes/submitpoetryRoutes'));
app.use('/', require('./routes/userAuthRoutes'));

app.get('/', (req, res) => res.send('Hello World!'));

// Connect DB
// db_connect();
mongoose
    .connect(process.env.mode === "production" ? process.env.db_production_url : process.env.db_local_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Server listening
const PORT = process.env.PORT || 8082; // default fallback
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
