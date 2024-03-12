const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    routeId: {
        type: String,
        required: true
    },
    busId: {
        type: String,
        required: true
    },
    departure: {
        type: Date,
        required: true
    },
    arrival: {
        type: Date,
        required: true
    },
    seats: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

const Schedule = mongoose.model("Schedule", scheduleSchema, "schedules");
module.exports = Schedule;