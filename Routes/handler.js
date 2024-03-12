const express = require("express")
const router = express.Router()

//Data controllers
const { allRoutes, createRoute, oneRoute, deleteRoute, registerUser, oneUser, allUsers, allBusses, oneBus, registerSchedule, oneSchedule, reserveSeats, saveUserSchedule } = require("../Controllers/dataControllers")

router.get("/route", allRoutes)

router.get("/route/:id", oneRoute)

router.post("/route/new", createRoute)

router.delete("/route/drop/:id", deleteRoute)

router.get("/bus", allBusses)

router.get("/bus/:id", oneBus)

router.post("/user/signup", registerUser)

router.post("/user/login", oneUser)

router.post("/user/schedule", saveUserSchedule)

router.get("/user/accounts", allUsers)

router.post("/schedule/register", registerSchedule)

router.get("/schedule/:id", oneSchedule)

router.post("/schedule/reserve", reserveSeats)


router.get("/hello", (req, res) => {
    res.status(200).json({ message: "API is ready to use" })
})

module.exports = router;