import express from "express"
import {
	appointmentCancel,
	appointmentComplete,
	appointmentDetail,
	appointmentList,
	changeAvailability,
	checkingDoctorAuth,
	doctorDashboard,
	doctorNotificationList,
	doctorProfile,
	loginDoctor,
	markNotificationAsRead,
	patientList,
	searchUsers,
	updateDoctorProfile,
	userDetail,
} from "../controllers/doctorController.js"
import authDoctor from "../middlewares/authDoctor.js"
import { specialityList } from "../controllers/adminController.js"
import upload from "../middlewares/multer.js"

const doctorRouter = express.Router()

// Auth
doctorRouter.get("/checking-authenticated", checkingDoctorAuth)
doctorRouter.post("/login", loginDoctor)

// Appointment Management
doctorRouter.get("/appointment-list", authDoctor, appointmentList)
doctorRouter.get(
	"/appointment-detail/:appointmentId",
	authDoctor,
	appointmentDetail
)
doctorRouter.post("/appointment-cancel", authDoctor, appointmentCancel)
doctorRouter.post("/appointment-complete", authDoctor, appointmentComplete)

// Patient Management
doctorRouter.get("/patient-list", authDoctor, patientList)
doctorRouter.get("/user-detail/:userId", authDoctor, userDetail)

// Profile Management
doctorRouter.get("/doctor-profile", authDoctor, doctorProfile)
doctorRouter.get("/speciality-list", authDoctor, specialityList)
doctorRouter.post(
	"/update-profile",
	upload.single("image"),
	authDoctor,
	updateDoctorProfile
)
doctorRouter.post("/change-availability", authDoctor, changeAvailability)

// Doctor Dashboard
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)

// Notifications
doctorRouter.get("/notification-list", authDoctor, doctorNotificationList)
doctorRouter.post(
	"/notification-read/:appointmentId",
	authDoctor,
	markNotificationAsRead
)

// Search
doctorRouter.get("/search-users", authDoctor, searchUsers)

export default doctorRouter
