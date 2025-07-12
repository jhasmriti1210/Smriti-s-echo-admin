const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

// FIRST load environment variables
dotenv.config();

// Then require rest
const db_connect = require('./utils/db');


// Middlewares
app.use(bodyParser.json());

// CORS Handling
if (process.env.MODE === 'production') {
    app.use(cors());
} else {
    app.use(cors({
        origin: ["http://localhost:5173", "http://localhost:3000"]
    }));
}

// app.use(passport.initialize());

// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/PoetryRoute'));
app.use('/', require('./routes/querySubscribeRoute'));
app.use('/', require('./routes/submitpoetryRoutes'));
app.use('/', require('./routes/userAuthRoutes'));

app.get('/', (req, res) => res.send('Hello World!'));

// Connect DB
db_connect();

// Server listening
const PORT = process.env.PORT || 8082; // default fallback
app.listen(PORT, () => console.log(`Server is running on port ${PORT}!`));
