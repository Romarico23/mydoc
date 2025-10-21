import express from "express"
import {
	addDoctor,
	addSpeciality,
	adminDashboard,
	appointmentCancel,
	appointmentList,
	changeAvailability,
	doctorList,
	loginAdmin,
	specialityList,
	checkingAdminAuth,
	appointmentComplete,
	appointmentDetail,
	doctorDetail,
	adminNotificationList,
	markNotificationAsRead,
	searchProfiles,
	patientList,
	userDetail, // Import searchDoctors
} from "../controllers/adminController.js"
import upload from "../middlewares/multer.js"
import authAdmin from "../middlewares/authAdmin.js"

const adminRouter = express.Router()

// Auth
adminRouter.get("/checking-authenticated", checkingAdminAuth)
adminRouter.post("/login", loginAdmin)

// Doctor Management
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor)
adminRouter.get("/doctor-list", authAdmin, doctorList)
adminRouter.get("/doctor-detail/:doctorId", authAdmin, doctorDetail)

// Patient Management
adminRouter.get("/patient-list", authAdmin, patientList)
adminRouter.get("/user-detail/:userId", authAdmin, userDetail)

// Speciality Management
adminRouter.post(
	"/add-speciality",
	authAdmin,
	upload.single("image"),
	addSpeciality
)
adminRouter.get("/speciality-list", authAdmin, specialityList)
adminRouter.post("/change-availability", authAdmin, changeAvailability)

// Appointment Management
adminRouter.get("/appointment-list", authAdmin, appointmentList)
adminRouter.get(
	"/appointment-detail/:appointmentId",
	authAdmin,
	appointmentDetail
)
adminRouter.post("/appointment-cancel", authAdmin, appointmentCancel)
adminRouter.post("/appointment-complete", authAdmin, appointmentComplete)

// Admin Dashboard
adminRouter.get("/dashboard", authAdmin, adminDashboard)

// Notifications
adminRouter.get("/notification-list", authAdmin, adminNotificationList)
// adminRouter.post("/notification-read", authAdmin, markNotificationAsRead)
adminRouter.post(
	"/notification-read/:appointmentId",
	authAdmin,
	markNotificationAsRead
)

// Search
adminRouter.get("/search-profiles", authAdmin, searchProfiles) // Add search route

export default adminRouter

// import express from "express"
// import {
// 	addDoctor,
// 	addSpeciality,
// 	adminDashboard,
// 	appointmentCancel,
// 	appointmentList,
// 	changeAvailability,
// 	doctorList,
// 	loginAdmin,
// 	specialityList,
// 	checkingAdminAuth,
// 	appointmentComplete,
// 	appointmentDetail,
// 	doctorDetail,
// 	adminNotificationList,
// 	markNotificationAsRead,
// } from "../controllers/adminController.js"
// import upload from "../middlewares/multer.js"
// import authAdmin from "../middlewares/authAdmin.js"

// const adminRouter = express.Router()

// // adminRouter.get("/checking-authenticated", authAdmin, checkingAdminAuth)
// // adminRouter.get("/checking-authenticated", authAdmin)
// adminRouter.get("/checking-authenticated", checkingAdminAuth)

// // Auth
// adminRouter.post("/login", loginAdmin)

// // Api
// adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor)
// adminRouter.post(
// 	"/add-speciality",
// 	authAdmin,
// 	upload.single("image"),
// 	addSpeciality
// )
// adminRouter.get("/speciality-list", authAdmin, specialityList)
// adminRouter.get("/doctor-list", authAdmin, doctorList)
// adminRouter.get("/doctor-detail/:doctorId", authAdmin, doctorDetail)
// adminRouter.post("/change-availability", authAdmin, changeAvailability)
// adminRouter.get("/appointment-list", authAdmin, appointmentList)
// adminRouter.get(
// 	"/appointment-detail/:appointmentId",
// 	authAdmin,
// 	appointmentDetail
// )
// adminRouter.post("/appointment-cancel", authAdmin, appointmentCancel)
// adminRouter.post("/appointment-complete", authAdmin, appointmentComplete)
// adminRouter.get("/dashboard", authAdmin, adminDashboard)
// adminRouter.get("/notification-list", authAdmin, adminNotificationList)
// adminRouter.post("/notification-read", authAdmin, markNotificationAsRead)

// export default adminRouter
