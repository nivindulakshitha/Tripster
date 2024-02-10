const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import the cors middleware
require("dotenv").config();
const routeHandler = require("./Routes/handler");

// Application
const app = express();

app.use(express.json());

// Use cors middleware
app.use(cors());

// Routes middleware
app.use((req, res, next) => {
    next();
});

// Routes handler
app.use('/api', routeHandler);

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
    dbName: 'WAD_DB',
}).then(() => {
    console.log("Database connected successfully.");

    // Listening for requests
    app.listen(process.env.PORT_NUMBER, () => {
        console.log("Listening on port 4000");
    });
}).catch((error) => {
    console.log("DB Error: ", error);
});
