const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    registration: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    seating: {
        type: Object,
        required: false,
        default: {}
    },
    active: {
        type: Boolean,
        default: true
    }
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