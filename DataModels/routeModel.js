const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    via: {
        type: String,
        default: null
    },
    active: {
        type: Boolean,
        default: true,
    },
    price: {
        type: Number,
        default: 0.00
    }
}, { timestamps: true });

const Route = mongoose.model("Route", routeSchema, "routes");
module.exports = Route;