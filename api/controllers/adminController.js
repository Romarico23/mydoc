import { body, validationResult } from "express-validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"
import specialityModel from "../models/specialityModel.js"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import notificationModel from "../models/notificationModel.js"

// API: Checking if Admin Authenticated
const checkingAdminAuth = async (req, res) => {
	try {
		const aToken = await req.headers.authorization?.split(" ")[1] // "Bearer token"
		const aToken_decode = jwt.verify(aToken, process.env.JWT_SECRET)

		// Check if the user is an admin
		if (aToken_decode.email === process.env.ADMIN_EMAIL) {
			// User is an admin, allow access
			return res.status(200).json({ success: true, message: "Welcome, Admin!" })
		} else {
			// User is not an admin, deny access
			return res.status(403).json({
				success: false,
				message:
					"Forbidden: You do not have permission to access this resource.",
			})
		}
	} catch (error) {
		console.error("Credential error:", error.message)
		return res.status(500).json({ success: false, message: "Server error" })
	}
}

// Admin Login
const loginAdmin = async (req, res) => {
	try {
		const { email, password } = req.body

		if (
			email === process.env.ADMIN_EMAIL &&
			password === process.env.ADMIN_PASSWORD
		) {
			const aToken = jwt.sign({ email }, process.env.JWT_SECRET, {
				// expiresIn: "7d",
			})

			return res.status(200).json({ success: true, aToken, role: "admin" })
		}

		return res
			.status(401)
			.json({ success: false, message: "Invalid credentials" })
	} catch (error) {
		console.error("Admin login error:", error.message)
		return res.status(500).json({ success: false, message: "Server error" })
	}
}

// API: Add doctor
const addDoctor = async (req, res) => {
	try {
		// Extract form data
		const {
			name,
			email,
			password,
			speciality,
			degree,
			experience,
			about,
			fees,
			address,
		} = req.body
		const imageFile = req.file // image file from request

		// Validation
		await body("name")
			.isLength({ min: 2 })
			.withMessage("Name must be at least 2 characters long")
			.run(req)
		await body("email").isEmail().withMessage("Invalid email address").run(req)
		await body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long")
			.run(req)
		await body("speciality")
			.notEmpty()
			.withMessage("Speciality is required")
			.run(req)
		await body("degree").notEmpty().withMessage("Degree is required").run(req)
		await body("experience")
			.notEmpty()
			.withMessage("Years of Experience is required")
			.run(req)
		await body("about")
			.isLength({ min: 10 })
			.withMessage("About must be at least 10 characters long")
			.run(req)
		await body("fees")
			.custom((value) => {
				if (isNaN(value)) {
					throw new Error("Fees should be a valid number")
				}
				if (value <= 0) {
					throw new Error("Fees should be greater than 0")
				}
				return true
			})
			.run(req)
		await body("address")
			.custom(async (value) => {
				try {
					const address = JSON.parse(value)

					if (!address.line1) {
						await body("address.line1")
							.notEmpty()
							.withMessage("Address Line 1 is required")
							.run(req)
					}
					if (!address.line2) {
						await body("address.line2")
							.notEmpty()
							.withMessage("Address Line 2 is required")
							.run(req)
					}
					return true
				} catch (e) {
					throw new Error(
						"Address must be a valid JSON object with both line1 and line2."
					)
				}
			})
			.run(req)

		// Image validation
		await body("image")
			.custom((_value, { req }) => {
				if (!req.file) {
					throw new Error("Image is required")
				}
				const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
				if (!allowedTypes.includes(req.file.mimetype)) {
					throw new Error(
						"Invalid image format. Allowed formats are: JPG, JPEG, PNG."
					)
				}
				return true
			})
			.run(req)

		// Check for validation errors
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "There were errors in your details",
				errors: errors.array(),
			})
		}

		// 1. Hash the password
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		// 2. Upload the image to Cloudinary
		const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
			resource_type: "image",
		})
		const imageUrl = imageUpload.secure_url

		// 3. Prepare the doctor data
		const doctorData = {
			name,
			email,
			image: imageUrl, // Image URL from Cloudinary
			password: hashedPassword, // Hashed password
			speciality,
			degree,
			experience,
			about,
			fees,
			address: JSON.parse(address),
		}

		// 4. Save the new doctor to the database
		const newDoctor = new doctorModel(doctorData)
		await newDoctor.save()

		// 5. Return success response
		return res.status(200).json({
			success: true,
			name: name,
			message: "Doctor added successfully!",
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: Add speciality/category
const addSpeciality = async (req, res) => {
	try {
		// Extract form data
		const { name, slug, description, specialityStatus } = req.body // Renamed from `status`
		const imageFile = req.file // Image file from request

		// Validation
		await body("name")
			.isLength({ min: 2 })
			.withMessage("Name must be at least 2 characters long")
			.run(req)
		await body("slug")
			.isLength({ min: 2 })
			.withMessage("Slug must be at least 2 characters long")
			.run(req)

		// Image validation
		await body("image")
			.custom((_value, { req }) => {
				if (!req.file) {
					throw new Error("Image is required")
				}
				const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
				if (!allowedTypes.includes(req.file.mimetype)) {
					throw new Error(
						"Invalid image format. Allowed formats are: JPG, JPEG, PNG."
					)
				}
				return true
			})
			.run(req)

		// Check for validation errors
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "There were errors in your details",
				errors: errors.array(),
			})
		}

		const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
			resource_type: "image",
		})
		const imageUrl = imageUpload.secure_url

		const specialityData = {
			name,
			slug,
			description,
			status: specialityStatus === "true", // Renamed from `status`
			image: imageUrl, // Image URL from Cloudinary
		}

		const newSpeciality = new specialityModel(specialityData)
		await newSpeciality.save()

		return res.status(200).json({
			success: true,
			name: name,
			message: "Speciality added successfully!",
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: specialityList/categoryList
const specialityList = async (req, res) => {
	try {
		const specialities = await specialityModel.find({})

		return res.status(200).json({
			success: true,
			specialities,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: Doctor list
const doctorList = async (req, res) => {
	try {
		const doctors = await doctorModel.find({}).select("-password")

		return res.status(200).json({
			success: true,
			doctors,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: Doctor detail
const doctorDetail = async (req, res) => {
	try {
		const { doctorId } = req.params
		const doctor = await doctorModel.findById(doctorId).select("-password")

		if (!doctor) {
			return res.status(404).json({
				success: false,
				message: "Doctor not found",
			})
		}

		return res.status(200).json({
			success: true,
			doctor,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: Change Availablitiy for each Doctor
const changeAvailability = async (req, res) => {
	try {
		const { docId } = req.body

		const docData = await doctorModel.findById(docId)

		if (!docData) {
			return res.status(404).json({
				success: false,
				message: `Doctor with ID ${docId} not found.`,
			})
		}

		await doctorModel.findByIdAndUpdate(docId, {
			available: !docData.available,
		})

		return res.status(200).json({
			success: true,
			message: "Availability changed successfully",
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}

// API to get all patients that already booked to you
const patientList = async (req, res) => {
	try {
		const patients = await userModel.find({}).select("-password")

		return res.status(200).json({
			success: true,
			patients,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API to get patient or user detail
const userDetail = async (req, res) => {
	try {
		const { userId } = req.params // Extract userId from URL params

		// Check if the userId is provided
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "User ID is required.",
			})
		}

		// Find the user by ID and exclude the password field
		const user = await userModel.findById(userId).select("-password")

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found.",
			})
		}

		// Return the user details
		return res.json({ success: true, user })
	} catch (error) {
		console.error("User detail error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
	}
}

// API to get all appointments list
const appointmentList = async (req, res) => {
	try {
		const appointments = await appointmentModel.find({})
		res.json({ success: true, appointments })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
}

// API to get appointment detail
const appointmentDetail = async (req, res) => {
	try {
		const { appointmentId } = req.params

		// Check if the appointmentId is provided
		if (!appointmentId) {
			return res.status(400).json({
				success: false,
				message: "Appointment ID is required.",
			})
		}

		// Find the appointment by ID
		const appointment = await appointmentModel.findById(appointmentId)

		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: "Appointment not found.",
			})
		}

		// Return the appointment details
		return res.json({ success: true, appointment })
	} catch (error) {
		console.error("Appointment detail error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
	}
}

// API to cancel appointment
const appointmentCancel = async (req, res) => {
	try {
		const { appointmentId } = req.body

		// Find the appointment
		const appointmentData = await appointmentModel.findById(appointmentId)

		// Check if the appointment exists
		if (!appointmentData) {
			return res.json({
				success: false,
				title: "Error",
				message: "Appointment not found",
			})
		}

		// Check if the appointment is already completed
		if (appointmentData.isCompleted) {
			return res.status(400).json({
				success: false,
				title: "Already Completed",
				message: "This appointment has already been completed",
			})
		}

		// Check if the appointment is already canceled
		if (appointmentData.cancelled) {
			return res.json({
				success: false,
				title: "Already Cancelled",
				message: "This appointment has already been cancelled",
			})
		}

		// Mark the appointment as cancelled
		await appointmentModel.findByIdAndUpdate(
			appointmentId,
			{ cancelled: true },
			{ new: true }
		)

		// Release the doctor's slot
		const { docId, slotDate, slotTime } = appointmentData
		const doctorData = await doctorModel.findById(docId)

		if (doctorData) {
			let slots_booked = doctorData.slots_booked

			// Remove the slot from the booked slots
			if (slots_booked[slotDate]) {
				slots_booked[slotDate] = slots_booked[slotDate].filter(
					(e) => e !== slotTime
				)
			}

			await doctorModel.findByIdAndUpdate(docId, { slots_booked })
		}

		// Respond with success
		return res.json({
			success: true,
			title: "Appointment Cancelled",
			message: "The appointment has been successfully cancelled",
		})
	} catch (error) {
		console.error(error)
		return res.json({ success: false, message: error.message })
	}
}

// API to complete appointment
const appointmentComplete = async (req, res) => {
	try {
		const { appointmentId } = req.body

		// Find the appointment
		const appointmentData = await appointmentModel.findById(appointmentId)

		// Check if the appointment exists
		if (!appointmentData) {
			return res.status(404).json({
				success: false,
				title: "Error",
				message: "Appointment not found",
			})
		}

		// Check if the appointment is already completed
		if (appointmentData.isCompleted) {
			return res.status(400).json({
				success: false,
				title: "Already Completed",
				message: "This appointment has already been completed",
			})
		}

		// Check if appointment was cancelled
		if (appointmentData.cancelled) {
			return res.status(400).json({
				success: false,
				title: "Cancelled Appointment",
				message: "Cannot complete a cancelled appointment",
			})
		}

		// Check if the appointment has been paid (either by cash or card)
		if (!appointmentData.cardPayment && !appointmentData.cashPayment) {
			return res.status(400).json({
				success: false,
				title: "Payment Required",
				message: "Cannot complete an appointment that hasn't been paid for",
			})
		}

		// Mark the appointment as completed
		await appointmentModel.findByIdAndUpdate(
			appointmentId,
			{
				isCompleted: true,
			},
			{ new: true }
		)

		// Respond with success
		return res.status(200).json({
			success: true,
			title: "Appointment Completed",
			message: "The appointment has been successfully marked as completed",
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
	try {
		const [doctors, users, appointments] = await Promise.all([
			doctorModel.find({}),
			userModel.find({}),
			appointmentModel.find({}).populate("docData", "name image"),
		])

		console.log(doctors)
		console.log(appointments)

		// Get the current year and month
		const currentYear = new Date().getFullYear()
		const currentMonth = new Date().getMonth()

		// Filter appointments by current month and year
		const currentMonthAppointments = appointments.filter((app) => {
			const appointmentDate = new Date(app.slotDate)
			return (
				appointmentDate.getFullYear() === currentYear &&
				appointmentDate.getMonth() === currentMonth
			)
		})

		// Count appointment statuses
		const cancelledCount = currentMonthAppointments.filter(
			(app) => app.cancelled
		).length
		const completedCount = currentMonthAppointments.filter(
			(app) => app.isCompleted
		).length
		const pendingCount = currentMonthAppointments.filter(
			(app) => !app.isCompleted && !app.cancelled
		).length

		// Sort appointments by date (newest first)
		const sortedAppointments = appointments.sort(
			(a, b) => new Date(b.slotDate) - new Date(a.slotDate)
		)

		// Define all months
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		]

		// Determine which months to display
		const visibleMonths =
			currentMonth < 6 ? months.slice(0, 6) : months.slice(6, 12) // Jan-Jun OR Jul-Dec

		// Initialize statistics only for the selected months
		const monthlyStats = {}
		visibleMonths.forEach((month) => {
			monthlyStats[month] = { doctors: 0, patients: 0, year: currentYear }
		})

		// Count patient registrations per month
		users.forEach((user) => {
			const userDate = new Date(user.createdAt)
			const month = userDate.toLocaleString("default", { month: "long" })
			const year = userDate.getFullYear()

			if (monthlyStats[month] && year === currentYear) {
				monthlyStats[month].patients += 1
			}
		})

		// Count doctor registrations per month
		doctors.forEach((doctor) => {
			const doctorDate = new Date(doctor.createdAt)
			const month = doctorDate.toLocaleString("default", { month: "long" })
			const year = doctorDate.getFullYear()

			if (monthlyStats[month] && year === currentYear) {
				monthlyStats[month].doctors += 1
			}
		})

		// Total counts for the current year
		const totalAppointments = appointments.filter((app) => {
			const appointmentDate = new Date(app.slotDate)
			return appointmentDate.getFullYear() === currentYear
		}).length

		const totalDoctors = doctors.filter((doc) => {
			const doctorDate = new Date(doc.createdAt)
			return doctorDate.getFullYear() === currentYear
		}).length

		const totalPatients = users.filter((user) => {
			const userDate = new Date(user.createdAt)
			return userDate.getFullYear() === currentYear
		}).length

		const dashboardData = {
			totalAppointments,
			totalDoctors,
			totalPatients,
			monthlyAppointments: currentMonthAppointments.length,
			appointmentStats: {
				cancelled: cancelledCount,
				completed: completedCount,
				pending: pendingCount,
			},
			latestAppointments: sortedAppointments.slice(0, 5), // Get the latest 5 appointments
			monthlyStats: visibleMonths.map((month) => ({
				month,
				year: currentYear,
				...monthlyStats[month],
			})),
		}

		res.json({ success: true, dashboardData })
	} catch (error) {
		console.error("Admin Dashboard Error:", error)
		res.status(500).json({ success: false, message: error.message })
	}
}

// API to getnotifications
const adminNotificationList = async (req, res) => {
	try {
		// Extract token from the Authorization header
		// const dToken = req.headers.authorization?.split(" ")[1]

		// if (!dToken) {
		// 	return res.status(401).json({
		// 		success: false,
		// 		message: "Unauthorized: No token provided.",
		// 	})
		// }

		// // Verify and decode the token
		// const decoded = jwt.verify(dToken, process.env.JWT_SECRET)
		// if (!decoded.id) {
		// 	return res.status(403).json({
		// 		success: false,
		// 		message: "Forbidden: Invalid token.",
		// 	})
		// }

		// Find the doctor by ID
		// const doctor = await doctorModel.findById(decoded.id)
		// if (!doctor) {
		// 	return res.status(403).json({
		// 		success: false,
		// 		message: "Forbidden: Doctor not found.",
		// 	})
		// }

		const notifications = await notificationModel
			.find({})
			.sort({ createdAt: -1 })

		res.status(200).json({ success: true, notifications })
	} catch (error) {
		console.error("Fetch notifications error:", error.message)
		res.status(500).json({ success: false, message: "Server error" })
	}
}

const markNotificationAsRead = async (req, res) => {
	try {
		const { appointmentId } = req.params // Extract appointmentId from params

		// Validate the appointment ID
		if (!appointmentId) {
			return res.status(404).json({
				success: false,
				message: "Invalid appointment ID.",
			})
		}

		// Find the notification by appointmentId in metadata
		const notification = await notificationModel.findOne({
			appointmentId: appointmentId,
		})

		// Check if the notification is already marked as read
		if (notification.read) {
			return res.status(200).json({
				success: true,
				message: "Notification was already marked as read.",
				notification: notification,
			})
		}

		// Find the notification by appointmentId in metadata
		const updatedNotification = await notificationModel.findOneAndUpdate(
			{ appointmentId: appointmentId }, // Query to find the notification
			{ $set: { read: true } },
			{ new: true } // Return the updated document
		)

		// Check if the notification was found and updated
		if (!updatedNotification) {
			return res.status(404).json({
				success: false,
				message: "Notification not found for the given appointment ID.",
			})
		}

		// Return success response
		res.status(200).json({
			success: true,
			message: "Notification marked as read.",
			notification: updatedNotification,
		})
	} catch (error) {
		console.error("Mark notification as read error:", error.message)
		res.status(500).json({ success: false, message: "Server error" })
	}
}

const searchProfiles = async (req, res) => {
	try {
		const { query } = req.query // Get the search query from the request

		if (!query) {
			return res.status(400).json({
				success: false,
				message: "Search query is required.",
			})
		}

		// Perform all three searches concurrently using Promise.all
		const [users, doctors] = await Promise.all([
			// Search Users
			userModel
				.find({
					$or: [
						{ name: { $regex: query, $options: "i" } }, // Search by name
						{ email: { $regex: query, $options: "i" } }, // Search by email
					],
				})
				.select("-password"),

			// Search Doctors
			doctorModel
				.find({
					$or: [
						{ name: { $regex: query, $options: "i" } }, // Search by name
						{ email: { $regex: query, $options: "i" } }, // Search by email
						{ speciality: { $regex: query, $options: "i" } }, // Search by speciality
					],
				})
				.select("-password"), // Exclude the password field
		])

		// Return the combined results
		return res.status(200).json({
			success: true,
			results: {
				users,
				doctors,
			},
		})
	} catch (error) {
		console.error("Combined search error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
	}
}

export {
	checkingAdminAuth,
	addDoctor,
	addSpeciality,
	specialityList,
	loginAdmin,
	doctorList,
	doctorDetail,
	changeAvailability,
	appointmentList,
	appointmentDetail,
	appointmentCancel,
	appointmentComplete,
	adminDashboard,
	adminNotificationList,
	markNotificationAsRead,
	searchProfiles,
	patientList,
	userDetail,
}
