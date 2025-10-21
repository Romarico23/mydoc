// import express from "express"
// import {
// 	appointmentDetails,
// 	appointmentList,
// 	bookAppointment,
// 	cancelAppointment,
// 	doctorList,
// 	getProfile,
// 	handlePayment,
// 	loginUser,
// 	rateDoctor,
// 	registerUser,
// 	specialityList,
// 	updateProfile,
// 	verifyStripepay,
// } from "../controllers/userController.js"
// import upload from "../middlewares/multer.js"
// import authUser from "../middlewares/authUser.js"

// const userRouter = express.Router()

// userRouter.post("/register", upload.single("image"), registerUser)
// userRouter.post("/login", loginUser)

// userRouter.get("/get-profile", authUser, getProfile)
// userRouter.post(
// 	"/update-profile",
// 	upload.single("image"),
// 	authUser,
// 	updateProfile
// )

// userRouter.get("/speciality-list", authUser, specialityList)
// userRouter.get("/doctor-list", authUser, doctorList)

// userRouter.post("/book-appointment", authUser, bookAppointment)
// userRouter.get("/appointment-list", authUser, appointmentList)

// userRouter.get(
// 	"/appointment-details/:appointmentId",
// 	authUser,
// 	appointmentDetails
// )

// userRouter.post("/cancel-appointment", authUser, cancelAppointment)
// userRouter.post("/handle-payment", authUser, handlePayment)
// userRouter.post("/verify-stripepay", authUser, verifyStripepay)

// userRouter.post("/rate-doctor", authUser, rateDoctor)

// export default userRouter

import express from "express"
import {
	addFavorite,
	appointmentDetails,
	appointmentList,
	bookAppointment,
	cancelAppointment,
	deleteFavorite,
	doctorList,
	favoriteDoctorsList,
	getDoctorRatings,
	getProfile,
	handlePayment,
	loginUser,
	rateDoctor,
	registerUser,
	searchDoctors,
	specialityList,
	topDoctorsList,
	updateProfile,
	verifyStripepay,
} from "../controllers/userController.js"
import upload from "../middlewares/multer.js"
import authUser from "../middlewares/authUser.js"

const userRouter = express.Router()

// Auth
userRouter.post("/register", upload.single("image"), registerUser)
userRouter.post("/login", loginUser)

// Profile Management
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post(
	"/update-profile",
	upload.single("image"),
	authUser,
	updateProfile
)

// Speciality and Doctor List
userRouter.get("/speciality-list", authUser, specialityList)
userRouter.get("/doctor-list", authUser, doctorList)
userRouter.get("/top-doctors-list", authUser, topDoctorsList)
userRouter.get("/favorite-doctors-list", authUser, favoriteDoctorsList)
userRouter.post("/add-favorite", authUser, addFavorite)
userRouter.post("/delete-favorite", authUser, deleteFavorite)

// Appointment Management
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointment-list", authUser, appointmentList)
userRouter.get(
	"/appointment-details/:appointmentId",
	authUser,
	appointmentDetails
)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)

// Payment Handling
userRouter.post("/handle-payment", authUser, handlePayment)
userRouter.post("/verify-stripepay", authUser, verifyStripepay)

// Rating
userRouter.post("/rate-doctor", authUser, rateDoctor)
userRouter.get("/rating-list/:docId", authUser, getDoctorRatings)

// Search
userRouter.get("/search-doctors", authUser, searchDoctors) // Add search route

export default userRouter
