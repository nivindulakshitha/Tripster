const express = require("express")
const router = express.Router()

//Data controllers
const { allRoutes, createRoute, oneRoute } = require("../Controllers/dataControllers")

router.get("/route", allRoutes)

router.get("/route/:id", oneRoute)

router.post("/route/new", createRoute)

router.get("/hello", (req, res) => {
    res.json({ message: "hello, you!" })
})

module.exports = router;