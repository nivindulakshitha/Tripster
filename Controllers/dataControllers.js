// Data models
const Route = require("../DataModels/routeModel");
const Bus = require("../DataModels/busModel");
const Schedule = require("../DataModels/scheduleModel");
const User = require("../DataModels/userModel")
const { ObjectId } = require("mongodb");

// Get all recorded routes
const allRoutes = async (req, res) => {
    const routes = await Route.find({}).sort({ createdAt: -1 });
    res.status(200).json(routes);
}

// Get specific route details
const oneRoute = async (req, res) => {
    const { id } = req.params
    const route = await Route.findOne({ "_id": id });

    if (!route) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(route);
}

// A new route creator
const createRoute = async (req, res) => {
    const { origin, destination, via, active } = req.body;
    const id = new ObjectId().toString();

    const newRoute = new Route({
        _id: id,
        origin: origin,
        destination: destination,
        via: via,
        active: active
    });

    await newRoute.save().then(() => {
        res.json({ "message": "new route is added, " + id })
    }).catch((error) => {
        console.log(error);
    });
}

// Delete a route
const deleteRoute = async (req, res) => {
    const { id } = req.params
    let result = await Route.deleteOne({ _id: id });

    if (!result) {
        return res.status(404).json({ "error": "No such id can be deleted" })
    }

    res.status(200).json(result.deletedCount + " document(s) was deleted");
}



// Routes working with users

// Get specific route details
const oneUser = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ "email": username, "password": password });

    if (!user) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(user);
}

const allBusses = async (req, res) => {
    const busses = await Bus.find({});

    if (!busses) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(busses);
}

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const id = new ObjectId().toString();

    const newUser = new User({
        _id: id,
        username: username,
        email: email,
        password: password
    });

    await newUser.save().then(() => {
        res.json({ "message": "new user is added, " + id })
    }).catch((error) => {
        console.log(error);
    });
}

// Get all busses
const allUsers = async (req, res) => {
    const users = await User.find({});

    if (!users) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(users);
}

// Get specific bus details
const oneBus = async (req, res) => {
    const { id } = req.params
    const bus = await Bus.findOne({ "_id": id });

    if (!bus) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(bus);
}


// Register a new schedule

const registerSchedule = async (req, res) => {
    const { route, bus, departure, arrival } = req.body;
    const id = new ObjectId().toString();

    const newSchedule = new Schedule({
        _id: id,
        routeId: route,
        busId: bus,
        departure: departure,
        arrival: arrival
    });

    await newSchedule.save().then(() => {
        res.json({ "message": "new shedule is added, " + id })
    }).catch((error) => {
        console.log(error);
    });
}

const oneSchedule = async (req, res) => {
    const { id } = req.params;
    const schedule = await Schedule.find({ "routeId": id });

    if (!schedule) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(schedule);
}

module.exports = {
    allRoutes,
    oneRoute,
    createRoute,
    deleteRoute,
    oneUser,
    allUsers,
    allBusses,
    oneBus,
    registerUser,
    registerSchedule,
    oneSchedule
}