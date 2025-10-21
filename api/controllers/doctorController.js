import { body, validationResult } from "express-validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"
import specialityModel from "../models/specialityModel.js"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import notificationModel from "../models/notificationModel.js"

// API: Checking if Doctor Authenticated
const checkingDoctorAuth = async (req, res) => {
	try {
		// Extract the token from the Authorization header
		const dToken = req.headers.authorization?.split(" ")[1] // "Bearer token"
		if (!dToken) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized: No token provided.",
			})
		}

		// Verify the token
		const dToken_decode = jwt.verify(dToken, process.env.JWT_SECRET)

		// Check if the decoded token contains an ID
		if (!dToken_decode.id) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: Invalid token.",
			})
		}

		// Check if the ID exists in the database
		const doctor = await doctorModel.findById(dToken_decode.id)
		if (!doctor) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: Doctor not found.",
			})
		}

		// If everything is valid, allow access
		return res.status(200).json({ success: true, message: "Welcome, Doctor!" })
	} catch (error) {
		console.error("Credential error:", error.message)

		// Handle other errors
		return res.status(500).json({ success: false, message: "Server error" })
	}
}

// API for doctor Login
const loginDoctor = async (req, res) => {
	try {
		const { email, password } = req.body
		const doctor = await doctorModel.findOne({ email })

		if (!doctor) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" })
		}

		const isMatch = await bcrypt.compare(password, doctor.password)

		if (isMatch) {
			const dToken = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
				// expiresIn: "7d",
			})

			return res.status(200).json({ success: true, dToken, role: "doctor" })
		} else {
			return res
				.status(401)
				.json({ success: false, message: "Invalid credentials" })
		}
	} catch (error) {
		console.error("Doctor login error:", error.message)
		return res.status(500).json({ success: false, message: "Server error" })
	}
}

// API to get all appointments list
const appointmentList = async (req, res) => {
	try {
		// Extract docId from the request body
		const { docId } = req.body

		// Validate docId
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}

		// Find the doctor by docId
		const doctor = await doctorModel.findById(docId)
		if (!doctor) {
			return res.status(404).json({
				success: false,
				message: "Doctor not found.",
			})
		}

		// Fetch appointments for the doctor using docId
		const appointments = await appointmentModel.find({ docId: doctor._id })

		// Return the appointment list
		return res.json({
			success: true,
			appointments,
		})
	} catch (error) {
		console.error("Appointment list error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
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

// // API to cancel appointment
// const appointmentCancel = async (req, res) => {
// 	try {
// 		const { appointmentId } = req.body

// 		// Find the appointment
// 		const appointmentData = await appointmentModel.findById(appointmentId)

// 		// Check if the appointment exists
// 		if (!appointmentData) {
// 			return res.json({
// 				success: false,
// 				title: "Error",
// 				message: "Appointment not found",
// 			})
// 		}

// 		// Check if the appointment is already completed
// 		if (appointmentData.isCompleted) {
// 			return res.status(400).json({
// 				success: false,
// 				title: "Already Completed",
// 				message: "This appointment has already been completed",
// 			})
// 		}

// 		// Check if appointment was cancelled
// 		if (appointmentData.cancelled) {
// 			return res.status(400).json({
// 				success: false,
// 				title: "Already Cancelled",
// 				message: "This appointment has already been cancelled",
// 			})
// 		}

// 		// Mark the appointment as cancelled
// 		await appointmentModel.findByIdAndUpdate(
// 			appointmentId,
// 			{ cancelled: true },
// 			{ new: true }
// 		)

// 		// Release the doctor's slot
// 		const { docId, slotDate, slotTime } = appointmentData
// 		const doctorData = await doctorModel.findById(docId)

// 		if (doctorData) {
// 			let slots_booked = doctorData.slots_booked

// 			// Remove the slot from the booked slots
// 			if (slots_booked[slotDate]) {
// 				slots_booked[slotDate] = slots_booked[slotDate].filter(
// 					(e) => e !== slotTime
// 				)
// 			}

// 			await doctorModel.findByIdAndUpdate(docId, { slots_booked })
// 		}

// 		// Respond with success
// 		res.json({
// 			success: true,
// 			title: "Appointment Cancelled",
// 			message: "The appointment has been successfully cancelled",
// 		})
// 	} catch (error) {
// 		console.error(error)
// 		res.json({ success: false, message: error.message })
// 	}
// }

// // API to complete appointment
// const appointmentComplete = async (req, res) => {
// 	try {
// 		const { appointmentId } = req.body

// 		// Find the appointment
// 		const appointmentData = await appointmentModel.findById(appointmentId)

// 		// Check if the appointment exists
// 		if (!appointmentData) {
// 			return res.status(404).json({
// 				success: false,
// 				title: "Error",
// 				message: "Appointment not found",
// 			})
// 		}

// 		// Check if the appointment is already completed
// 		if (appointmentData.isCompleted) {
// 			return res.status(400).json({
// 				success: false,
// 				title: "Already Completed",
// 				message: "This appointment has already been completed",
// 			})
// 		}

// 		// Check if appointment was cancelled
// 		if (appointmentData.cancelled) {
// 			return res.status(400).json({
// 				success: false,
// 				title: "Cancelled Appointment",
// 				message: "Cannot complete a cancelled appointment",
// 			})
// 		}

// 		// Mark the appointment as completed
// 		await appointmentModel.findByIdAndUpdate(
// 			appointmentId,
// 			{
// 				isCompleted: true,
// 			},
// 			{ new: true }
// 		)

// 		// Respond with success
// 		res.status(200).json({
// 			success: true,
// 			title: "Appointment Completed",
// 			message: "The appointment has been successfully marked as completed",
// 			// appointment: updatedAppointment
// 		})
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({
// 			success: false,
// 			message: error.message,
// 		})
// 	}
// }

// API to get all patients that already booked to you
const patientList = async (req, res) => {
	try {
		// Extract docId from the request body
		const { docId } = req.body

		// Validate docId
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}

		// Find the doctor by docId
		const doctor = await doctorModel.findById(docId)
		if (!doctor) {
			return res.status(404).json({
				success: false,
				message: "Doctor not found.",
			})
		}

		// Fetch all appointments for this doctor
		const appointments = await appointmentModel.find({ docId: doctor._id })

		// Extract unique patient IDs from the appointments
		const uniqueUserIds = [...new Set(appointments.map((appt) => appt.userId))]

		// Fetch user details for each unique patient ID
		const patients = await userModel
			.find({ _id: { $in: uniqueUserIds } })
			.select("-password")

		// Return the patient list
		return res.json({
			success: true,
			patients,
		})
	} catch (error) {
		console.error("Patient list error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
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

// API to get Doctor profile
const doctorProfile = async (req, res) => {
	try {
		// Extract docId from the request body
		const { docId } = req.body

		// Validate docId
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}

		// Find the doctor by docId and exclude sensitive fields (e.g., password)
		const doctor = await doctorModel.findById(docId).select("-password")

		if (!doctor) {
			return res.status(404).json({
				success: false,
				message: "Doctor not found.",
			})
		}

		// Return the doctor's profile
		return res.json({
			success: true,
			doctor,
		})
	} catch (error) {
		console.error("Doctor profile error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
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

// API: Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
	try {
		// Extract form data
		const {
			name,
			speciality,
			degree,
			experience,
			about,
			fees,
			address,
			docId,
		} = req.body
		const imageFile = req.file // image file from request (can be undefined)

		// Validate docId
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}

		// Validation
		await body("name")
			.isLength({ min: 2 })
			.withMessage("Name must be at least 2 characters long")
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

		// Image validation (optional)
		await body("image")
			.custom((_value, { req }) => {
				if (req.file) {
					// Only validate if a file is provided
					const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
					if (!allowedTypes.includes(req.file.mimetype)) {
						throw new Error(
							"Invalid image format. Allowed formats are: JPG, JPEG, PNG."
						)
					}
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

		// 1. Upload the image to Cloudinary (only if provided)
		let imageUrl = null
		if (imageFile) {
			const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
				resource_type: "image",
			})
			imageUrl = imageUpload.secure_url
		}

		// 2. Prepare the doctor data (excluding password)
		const doctorData = {
			name,
			speciality,
			degree,
			experience,
			about,
			fees,
			address: JSON.parse(address),
			// date: Date.now(),
		}

		// Add image URL to doctorData only if an image was uploaded
		if (imageUrl) {
			doctorData.image = imageUrl
		}

		// 3. Find the doctor by ID and update their profile
		const updatedDoctor = await doctorModel.findOneAndUpdate(
			{ _id: docId }, // Find by ID from the token
			doctorData, // Update with new data
			{ new: true, projection: { password: 0 } } // Return the updated document without password
		)

		if (!updatedDoctor) {
			return res.status(404).json({
				success: false,
				message: "Doctor not found",
			})
		}

		// 4. Return success response
		return res.status(200).json({
			success: true,
			data: updatedDoctor,
			message: "Doctor profile updated successfully!",
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: Change your Availablitiy
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

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
	try {
		const { docId } = req.body

		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}

		// Find doctor
		const doctor = await doctorModel.findById(docId)
		if (!doctor) {
			return res.status(404).json({
				success: false,
				message: "Doctor not found.",
			})
		}

		// Fetch appointments related to this doctor
		const appointments = await appointmentModel.find({ docId: doctor._id })

		// Extract unique patient IDs
		const uniqueUserIds = [...new Set(appointments.map((appt) => appt.userId))]

		// Fetch patient details
		const patients = await userModel
			.find({ _id: { $in: uniqueUserIds } })
			.select("-password")

		// Get current year and month
		const currentYear = new Date().getFullYear()
		const currentMonth = new Date().getMonth()

		// Filter appointments for the current month
		const currentMonthAppointments = appointments.filter((appt) => {
			const apptDate = new Date(appt.slotDate)
			return (
				apptDate.getFullYear() === currentYear &&
				apptDate.getMonth() === currentMonth
			)
		})

		// Count appointment statuses
		const cancelledCount = currentMonthAppointments.filter(
			(appt) => appt.cancelled
		).length
		const completedCount = currentMonthAppointments.filter(
			(appt) => appt.isCompleted
		).length
		const pendingCount = currentMonthAppointments.filter(
			(appt) => !appt.isCompleted && !appt.cancelled
		).length

		// Sort appointments by date (newest first)
		const sortedAppointments = appointments.sort(
			(a, b) => new Date(b.slotDate) - new Date(a.slotDate)
		)

		// Calculate earnings for the current month
		const monthlyEarnings = currentMonthAppointments
			.filter((appt) => appt.isCompleted)
			.reduce((total, appt) => total + appt.amount, 0)

		// Total earnings for the year
		const totalEarnings = appointments
			.filter((appt) => appt.isCompleted)
			.reduce((total, appt) => total + appt.amount, 0)

		// Define months for statistics
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

		const visibleMonths =
			currentMonth < 6 ? months.slice(0, 6) : months.slice(6, 12)

		// Initialize monthly statistics
		const monthlyStats = {}
		visibleMonths.forEach((month) => {
			monthlyStats[month] = { appointments: 0, earnings: 0, year: currentYear }
		})

		// Populate monthly statistics
		appointments.forEach((appt) => {
			const apptDate = new Date(appt.slotDate)
			const month = apptDate.toLocaleString("default", { month: "long" })
			const year = apptDate.getFullYear()

			if (monthlyStats[month] && year === currentYear) {
				monthlyStats[month].appointments += 1
				if (appt.isCompleted) {
					monthlyStats[month].earnings += appt.amount
				}
			}
		})

		// Construct response data
		const dashboardData = {
			totalAppointments: appointments.length,
			totalEarnings,
			totalPatients: patients.length,
			monthlyAppointments: currentMonthAppointments.length,
			monthlyEarnings,
			appointmentStats: {
				cancelled: cancelledCount,
				completed: completedCount,
				pending: pendingCount,
			},
			latestAppointments: sortedAppointments.slice(0, 5), // Latest 5 appointments
			monthlyStats: visibleMonths.map((month) => ({
				month,
				year: currentYear,
				...monthlyStats[month],
			})),
		}

		res.json({ success: true, dashboardData })
	} catch (error) {
		console.error("Doctor Dashboard Error:", error)
		res.status(500).json({ success: false, message: error.message })
	}
}

// const doctorDashboard = async (req, res) => {
// 	try {
// 		// Extract docId from the request body
// 		const { docId } = req.body

// 		// Validate docId
// 		if (!docId) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Bad Request: docId is required.",
// 			})
// 		}

// 		// Find the doctor by docId
// 		const doctor = await doctorModel.findById(docId)
// 		if (!doctor) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Doctor not found.",
// 			})
// 		}

// 		// Fetch all appointments for this doctor
// 		const appointments = await appointmentModel.find({ docId: doctor._id })

// 		// Extract unique patient IDs from the appointments
// 		const uniqueUserIds = [...new Set(appointments.map((appt) => appt.userId))]

// 		// Fetch user details for each unique patient ID
// 		const patients = await userModel
// 			.find({ _id: { $in: uniqueUserIds } })
// 			.select("-password")

// 		// Sort appointments by date (newest first)
// 		const sortedAppointments = appointments.sort(
// 			(a, b) => new Date(b.slotDate) - new Date(a.slotDate)
// 		)

// 		// Calculate earnings for the current month
// 		const currentDate = new Date()
// 		const startOfMonth = new Date(
// 			currentDate.getFullYear(),
// 			currentDate.getMonth(),
// 			1
// 		)
// 		const endOfMonth = new Date(
// 			currentDate.getFullYear(),
// 			currentDate.getMonth() + 1,
// 			0
// 		)
// 		endOfMonth.setHours(23, 59, 59, 999) // Set to last moment of the month

// 		// Filter completed appointments within the current month
// 		const monthlyEarnings = appointments
// 			.filter((appt) => {
// 				const apptDate = new Date(appt.slotDate)
// 				return (
// 					appt.isCompleted === true &&
// 					apptDate >= startOfMonth &&
// 					apptDate <= endOfMonth
// 				)
// 			})
// 			.reduce((total, appt) => total + appt.amount, 0)

// 		// Prepare the dashboard data
// 		const dashboardData = {
// 			appointments: appointments.length,
// 			patients: patients.length,
// 			monthlyEarnings: monthlyEarnings,
// 			latestAppointments: sortedAppointments.slice(0, 5), // Get the latest 5 appointments
// 		}

// 		// Return the dashboard data
// 		res.json({ success: true, dashboardData })
// 	} catch (error) {
// 		console.error("Dashboard error:", error)
// 		res.status(500).json({ success: false, message: error.message })
// 	}
// }

// API to getnotifications
const doctorNotificationList = async (req, res) => {
	try {
		// const { type } = req.query; // Optional filter by type

		// Extract docId from the request body
		const { docId } = req.body

		// Validate docId
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}
		// Find the doctor by ID
		const doctor = await doctorModel.findById(docId)
		if (!doctor) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: Doctor not found.",
			})
		}

		// // Build the query
		// const query = { doctorId: docId };
		// if (type) {
		// 	query.type = type;
		// }

		// Fetch notifications
		const notifications = await notificationModel
			.find({ docId: doctor._id })
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

// API: Search Users
const searchUsers = async (req, res) => {
	try {
		// Extract docId from the request body and query from the query string
		const { docId } = req.body
		const { query } = req.query

		// Validate the search query
		if (!query) {
			return res.status(400).json({
				success: false,
				message: "Search query is required.",
			})
		}

		// Validate docId
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Bad Request: docId is required.",
			})
		}

		// Find the doctor by ID
		const doctor = await doctorModel.findById(docId)
		if (!doctor) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: Doctor not found.",
			})
		}

		// Fetch appointments for this doctor using `docId`
		const appointments = await appointmentModel.find({ docId: doctor._id })

		// Extract user IDs from the appointments
		const userIds = appointments.map((appointment) => appointment.userId)

		// Perform a case-insensitive search for users by name or email
		const users = await userModel
			.find({
				_id: { $in: userIds }, // Filter by user IDs from appointments
				$or: [
					{ name: { $regex: query, $options: "i" } }, // Search by name
					{ email: { $regex: query, $options: "i" } }, // Search by email
				],
			})
			.select("-password") // Exclude the password field from the results

		return res.status(200).json({
			success: true,
			users,
		})
	} catch (error) {
		console.error("Search users error:", error.message)
		return res.status(500).json({
			success: false,
			message: "Server error",
		})
	}
}

export {
	loginDoctor,
	checkingDoctorAuth,
	appointmentList,
	patientList,
	specialityList,
	doctorProfile,
	updateDoctorProfile,
	changeAvailability,
	doctorDashboard,
	appointmentCancel,
	appointmentComplete,
	appointmentDetail,
	userDetail,
	doctorNotificationList,
	markNotificationAsRead,
	searchUsers,
}
