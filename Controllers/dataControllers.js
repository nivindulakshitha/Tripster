// Data models
const Route = require("../DataModels/routeModel");

// Get all recorded routes
const allRoutes = async (req, res) => {
    const routes = await Route.find({}).sort({ createdAt: -1 });
    res.status(200).json(routes);
}

// Get specific route details
const oneRoute = async (req, res) => {
    const { id } = req.params
    const route = await Route.findById(id);

    if (!route) {
        return res.status(404).json({ "error": "No such id can be found" })
    }

    res.status(200).json(route);
}

// A new route creator
const createRoute = async (req, res) => {
    const { origin, destination, via, active } = req.body;

    const newRoute = new Route({
        origin: origin,
        destination: destination,
        via: via,
        active: active
    });

    await newRoute.save().then(() => {
        res.json({ "message": "new route is added" })
        console.log("New route is saved");
    }).catch((error) => {
        console.log(error);
    });
}

module.exports = {
    allRoutes,
    oneRoute,
    createRoute
}