const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Route = mongoose.model("Route", routeSchema, "routes");
module.exports = Route;