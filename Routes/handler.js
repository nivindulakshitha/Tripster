const express = require("express")
const router = express.Router()

//Data controllers
const { allRoutes, createRoute, oneRoute, deleteRoute } = require("../Controllers/dataControllers")

router.get("/route", allRoutes)

router.get("/route/:id", oneRoute)

router.post("/route/new", createRoute)

router.delete("/route/drop/:id", deleteRoute)

router.get("/hello", (req, res) => {
    res.status(200).json({ message: "API is ready to use" })
})

module.exports = router;