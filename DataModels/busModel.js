const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    registration: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    seating: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    latency: {
        type: Date,
        default: 0,
    },
}, { timestamps: true });

const Bus = mongoose.model("Bus", busSchema, "buses");
module.exports = Bus;

`
Available types of the bus
1. City Bus
2. Coach/Intercity Bus
3. Tour Bus
4. Minibus
`