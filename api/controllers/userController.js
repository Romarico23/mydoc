import userModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { validationResult, body, check } from "express-validator"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import specialityModel from "../models/specialityModel.js"
import appointmentModel from "../models/appointmentModel.js"
import Stripe from "stripe"
import notificationModel from "../models/notificationModel.js"
import ratingModel from "../models/ratingModel.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const paymentCurrency = process.env.CURRENCY

// API to register user
const registerUser = async (req, res) => {
	try {
		// Extract form data
		const { name, email, password } = req.body
		const imageFile = req.file // image file from request (nullable)

		// Validation - Similar to login, we'll use express-validator to check fields
		await body("name")
			.isLength({ min: 2 })
			.withMessage("Name must be at least 2 characters long")
			.notEmpty()
			.withMessage("Full Name is required")
			.run(req)

		await body("email")
			.custom(async (value) => {
				// Check if email already exists
				const userExists = await userModel.findOne({ email: value })
				if (userExists) {
					throw new Error("Email already exists")
				}
				return true
			})
			.isEmail()
			.withMessage("Invalid email address")
			.notEmpty()
			.withMessage("Email is required")
			.run(req)

		await body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long")
			.notEmpty()
			.withMessage("Password is required")
			.run(req)

		// Image validation (optional)
		await body("image")
			.custom((_value, { req }) => {
				if (req.file) {
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
				errors: errors.array(),
			})
		}

		// Hash the password
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		// Create user data object
		const userData = {
			name,
			email,
			password: hashedPassword,
		}

		// Handle image upload if file exists
		if (imageFile) {
			const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
				resource_type: "image",
			})

			// Add image URL to user data
			userData.image = imageUpload.secure_url
		}

		// Save the user in the database
		const newUser = new userModel(userData)
		await newUser.save()

		// Generate a JWT token
		const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
			// expiresIn: "7d",
		})

		// Return success response with token and user details
		return res.status(200).json({
			success: true,
			token,
			message: "User registered successfully!",
		})
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ success: false, message: "Server error" })
	}
}

const loginUser = async (req, res) => {
	try {
		// Validate email with custom logic
		await body("email")
			.custom(async (value) => {
				// Check if user exists
				const user = await userModel.findOne({ email: value })
				if (!user) {
					throw new Error("User does not exist")
				}
				// Attach the user to the request object for use in password validation
				req.user = user
				return true
			})
			.isEmail()
			.withMessage("Invalid email address")
			.notEmpty()
			.withMessage("Email is required")
			.run(req)

		// Validate password with custom logic
		await body("password")
			.custom(async (value, { req }) => {
				// Use req.user set in the email validation step
				const user = req.user
				if (user) {
					const isMatch = await bcrypt.compare(value, user.password)
					if (!isMatch) {
						throw new Error("Invalid credentials")
					}
				}
				return true
			})
			.notEmpty()
			.withMessage("Password is required")
			.run(req)

		// Collect validation errors
		const errors = validationResult(req).array()

		// If there are any validation or credential errors, return them
		if (errors.length > 0) {
			return res.status(400).json({
				success: false,
				errors,
			})
		}

		// If no errors, generate JWT and return success response
		const user = req.user // This is set during email validation
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			// expiresIn: "7d",
		})

		return res.status(200).json({
			success: true,
			token,
			message: "Logged in successfully!",
		})
	} catch (error) {
		console.error(error.message)
		return res.status(500).json({ success: false, message: "Server error" })
	}
}

const getProfile = async (req, res) => {
	try {
		const { userId } = req.body

		const userData = await userModel.findById(userId).select("-password")

		return res.status(200).json({
			success: true,
			userData,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const updateProfile = async (req, res) => {
	try {
		const { userId, name, email, phone, address, birthDate, gender } = req.body
		const imageFile = req.file

		// Retrieve current user data
		const currentUser = await userModel.findById(userId)
		if (!currentUser) {
			return res.status(404).json({ success: false, message: "User not found" })
		}

		// Validation - Similar to login, we'll use express-validator to check fields
		await body("name")
			.isLength({ min: 2 })
			.withMessage("Name must be at least 2 characters long")
			.notEmpty()
			.withMessage("Full Name is required")
			.run(req)

		// Always run basic validations for email
		await body("email")
			.custom(async (value) => {
				if (email !== currentUser.email) {
					const userExists = await userModel.findOne({ email: value })
					if (userExists) {
						throw new Error("Email already exists")
					}
					return true
				}
			})
			.isEmail()
			.withMessage("Invalid email address")
			.notEmpty()
			.withMessage("Email is required")
			.run(req)

		await body("phone")
			.trim() // Removes any extra spaces
			.notEmpty()
			.withMessage("Phone number is required")
			.isNumeric()
			.withMessage("Phone number must contain only numbers")
			.isLength({ min: 10, max: 15 })
			.withMessage("Phone number must be between 10 and 15 digits")
			.custom((value) => {
				if (!/^\d+$/.test(value)) {
					throw new Error("Phone should contain only numeric digits")
				}
				return true
			})
			.run(req)

		// Image validation (optional)
		await body("image")
			.custom((_value, { req }) => {
				if (req.file) {
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
				errors: errors.array(),
			})
		}

		// Prepare updated data
		const updatedData = {
			name,
			phone,
			// address: JSON.parse(address),
			address: typeof address === "string" ? JSON.parse(address) : address,
			birthDate,
			gender,
		}

		// Update email if it has changed
		if (email && email !== currentUser.email) {
			updatedData.email = email
		}

		// Handle image upload if file exists
		if (imageFile) {
			const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
				resource_type: "image",
			})

			// Add image URL to update
			updatedData.image = imageUpload.secure_url
		}

		// Update profile data in the database
		await userModel.findByIdAndUpdate(userId, updatedData)

		return res.status(201).json({
			success: true,
			message: "Profile Updated",
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: specialityList/categoryList/doctorCounts according to speciality
const specialityList = async (req, res) => {
	try {
		// Fetch all specialities
		const specialities = await specialityModel.find({})

		// Count doctors for each speciality
		const doctorCounts = await doctorModel.aggregate([
			{
				$group: {
					_id: "$speciality",
					count: { $sum: 1 },
				},
			},
		])

		// Convert doctorCounts array into an object for easy lookup
		const doctorCountMap = doctorCounts.reduce((acc, { _id, count }) => {
			acc[_id] = count
			return acc
		}, {})

		// Attach doctor count to each speciality
		const specialitiesWithCount = specialities.map((speciality) => ({
			...speciality.toObject(),
			doctorCount: doctorCountMap[speciality.name] || 0, // Default to 0 if no doctors
		}))

		return res.status(200).json({
			success: true,
			specialities: specialitiesWithCount,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API: Doctor list according to speciality
const doctorList = async (req, res) => {
	try {
		// Get the speciality from the query parameters
		const { speciality } = req.query

		// Build the query object
		const query = {}
		if (speciality) {
			query.speciality = speciality // Assuming 'speciality' field exists in the doctorModel
		}

		// Find doctors matching the query and exclude the password field
		const doctors = await doctorModel.find(query).select("-password")

		return res.status(200).json({
			success: true,
			doctors,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const topDoctorsList = async (req, res) => {
	try {
		const doctors = await doctorModel
			.find({})
			// .find({ "ratings.average": { $gt: 0 } }) // ✅ Only doctors with ratings > 0
			.select("-password")
			.sort({ "ratings.average": -1, "ratings.count": -1 }) // Sort by highest rating first, then by count
		// .limit(top ? parseInt(top) : 10); // Limit results if `top` is provided, default to 10

		return res.status(200).json({
			success: true,
			doctors,
		})
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message })
	}
}

const favoriteDoctorsList = async (req, res) => {
	try {
		const { userId } = req.body

		const userData = await userModel
			.findById(userId)
			.select("-password") // Exclude user's password
			.populate({
				path: "favorites",
				select: "-password", // Exclude password from populated doctors
			})

		if (!userData) {
			return res.status(404).json({ success: false, message: "User not found" })
		}
		const userStringify = JSON.stringify(userData)

		return res.status(200).json({
			success: true,
			userStringify,
		})
	} catch (error) {
		console.error("Error:", error)
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API to book appointment
const bookAppointment = async (req, res) => {
	try {
		const { userId, docId, slotDate, slotTime } = req.body

		// Check if the slot is already booked in the Appointment collection
		const existingAppointment = await appointmentModel.findOne({
			docId,
			slotDate,
			slotTime,
		})

		if (existingAppointment) {
			return res.status(400).json({
				success: false,
				message:
					"This time slot is already booked in the Appointment collection.",
			})
		}

		// Fetch doctor data
		const docData = await doctorModel.findById(docId).select("-password")

		if (!docData.available) {
			return res
				.status(400)
				.json({ success: false, message: "Doctor not available" })
		}

		// Update the doctor's slots_booked field
		let slots_booked = docData.slots_booked || {} // Ensure slots_booked is initialized
		if (!slots_booked[slotDate]) {
			slots_booked[slotDate] = []
		}
		slots_booked[slotDate].push(slotTime)

		// Fetch user data
		const userData = await userModel.findById(userId).select("-password")

		// Prepare appointment data
		const appointmentData = {
			userId,
			docId,
			userData,
			docData: { ...docData.toObject(), slots_booked: undefined }, // Exclude slots_booked from docData
			amount: docData.fees,
			slotTime,
			slotDate,
			cardPayment: false,
			cashPayment: false,
			cancelled: false,
			isCompleted: false,
			// date: Date.now(),
		}

		// Save new appointment
		const newAppointment = new appointmentModel(appointmentData)
		await newAppointment.save()

		// Save updated slots_booked data in the doctor model
		await doctorModel.findByIdAndUpdate(docId, { slots_booked }, { new: true })

		// Create a notification for the doctor
		try {
			await notificationModel.create({
				docId,
				appointmentId: newAppointment._id,
				message: "New appointment booked",
				type: "appointment",
				metadata: {
					slotDate,
					slotTime,
				},
			})
		} catch (notificationError) {
			console.error("Failed to create notification:", notificationError.message)
		}

		// Respond with success message
		res.json({ success: true, message: "Appointment Booked" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, message: error.message })
	}
}

const addFavorite = async (req, res) => {
	try {
		const { userId, docId } = req.body

		if (!userId || !docId) {
			return res.json({
				success: false,
				title: "Error",
				message: "User ID and Doctor ID are required",
			})
		}

		const user = await userModel.findById(userId)
		if (!user) {
			return res.json({ success: false, message: "User not found" })
		}

		// Check if the doctor is already in the favorites list
		if (!user.favorites.includes(docId)) {
			user.favorites.push(docId)
			await user.save()
		}

		return res.json({
			success: true,
			title: "Success",
			message: "Doctor has been added to your favorites.",
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ success: false, message: error.message })
	}
}

const deleteFavorite = async (req, res) => {
	try {
		const { userId, docId } = req.body

		if (!userId || !docId) {
			return res.json({
				success: false,
				title: "Error",
				message: "User ID and Doctor ID are required",
			})
		}

		const user = await userModel.findById(userId)
		if (!user) {
			return res.json({ success: false, message: "User not found" })
		}

		// Check if the doctor is in the favorites list
		if (user.favorites.includes(docId)) {
			user.favorites = user.favorites.filter((id) => id.toString() !== docId)
			await user.save()
		}

		return res.json({
			success: true,
			title: "Success",
			message: "Doctor has been removed from your favorites.",
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ success: false, message: error.message })
	}
}

// API to get user appointments for frontend appointments screen
const appointmentList = async (req, res) => {
	try {
		const { userId } = req.body

		// Fetch appointments and sort by slotDate and slotTime (latest first)
		const appointments = await appointmentModel
			.find({ userId })
			.sort({ slotDate: -1, slotTime: -1 }) // Sort by slotDate and slotTime in descending order

		return res.json({ success: true, appointments })
	} catch (error) {
		console.log(error)
		return res.json({ success: false, message: error.message })
	}
}

// API to get appointment details
const appointmentDetails = async (req, res) => {
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

const cancelAppointment = async (req, res) => {
	try {
		const { userId, appointmentId } = req.body

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

		// Verify the appointment belongs to the user
		if (appointmentData.userId !== userId) {
			return res.json({
				success: false,
				title: "Unauthorized Action",
				message: "You are not authorized to cancel this appointment",
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

			await doctorModel.findByIdAndUpdate(
				docId,
				{ slots_booked },
				{ new: true }
			)
		}

		// Respond with success
		res.json({
			success: true,
			title: "Appointment Cancelled",
			message: "Your appointment has been successfully cancelled",
		})
	} catch (error) {
		console.error(error)
		res.json({ success: false, message: error.message })
	}
}

// API to make payment of appointment using stripepay
const handlePayment = async (req, res) => {
	try {
		const { paymentMethod, appointmentId } = req.body

		const appointmentData = await appointmentModel.findById(appointmentId)

		// Validate required fields
		if (!paymentMethod || appointmentData.cancelled) {
			return res.status(400).json({
				success: false,
				title: "Invalid Payment Request",
				message: "Appointment is either cancelled or not found.",
			})
		}

		if (paymentMethod === "card") {
			// Process Card Payment (Stripe)

			const customer = await stripe.customers.create()
			const ephemeralKey = await stripe.ephemeralKeys.create(
				{ customer: customer.id },
				{ apiVersion: "2024-06-20" }
			)

			const paymentIntent = await stripe.paymentIntents.create({
				amount: appointmentData.amount * 100, // Convert to the smallest currency unit
				currency: process.env.CURRENCY,
				description: `Payment for appointment ${appointmentId}`,
				customer: customer.id,
				metadata: { appointmentId },
			})

			return res.json({
				success: true,
				title: "Card Payment Initiated",
				message: "Card payment process started successfully",
				clientSecret: paymentIntent.client_secret,
				ephemeralKey: ephemeralKey.secret,
				customer: customer.id,
			})
		} else if (paymentMethod === "cash") {
			// Update the appointment as paid with cash
			await appointmentModel.findByIdAndUpdate(appointmentId, {
				cashPayment: true,
			})
			// Handle Cash Payment
			return res.json({
				success: true,
				title: "Cash Payment Selected",
				message: "You selected Cash Payment. Please pay in person.",
			})
		} else {
			// Invalid payment method
			return res.status(400).json({
				success: false,
				message: "Invalid payment method. Please select Card or Cash.",
			})
		}
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}

const verifyStripepay = async (req, res) => {
	try {
		const { appointmentId } = req.body

		// Validate required fields
		if (!appointmentId) {
			return res.status(400).json({
				success: false,
				title: "Invalid Request",
				message: "Appointment ID is required.",
			})
		}

		// Find the appointment in the database
		const appointmentData = await appointmentModel.findById(appointmentId)

		// Check if the appointment exists
		if (!appointmentData) {
			return res.status(404).json({
				success: false,
				title: "Appointment Not Found",
				message: "The specified appointment does not exist.",
			})
		}

		// Check if the appointment is already paid via card
		if (appointmentData.cardPayment) {
			return res.status(400).json({
				success: false,
				title: "Payment Already Processed",
				message: "This appointment has already been paid via card.",
			})
		}

		// Update the appointment as paid with card
		await appointmentModel.findByIdAndUpdate(appointmentId, {
			cardPayment: true,
		})

		// Send a success response
		return res.status(200).json({
			success: true,
			title: "Payment Verified",
			message:
				"The card payment has been successfully verified and marked as paid.",
		})
	} catch (error) {
		console.error("Error verifying payment:", error.message)

		// Handle errors gracefully
		return res.status(500).json({
			success: false,
			title: "Internal Server Error",
			message: "An error occurred while verifying the payment.",
			error: error.message,
		})
	}
}

// API to submit a rating for a completed appointment
const rateDoctor = async (req, res) => {
	try {
		const { appointmentId, rating, comment } = req.body

		// Validate the rating
		if (rating < 1 || rating > 5) {
			return res.status(400).json({
				success: false,
				message: "Rating must be between 1 and 5.",
			})
		}

		// Find the appointment
		const appointment = await appointmentModel.findById(appointmentId)

		// Check if the appointment exists
		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: "Appointment not found.",
			})
		}

		// Check if the appointment is completed
		if (!appointment.isCompleted) {
			return res.status(400).json({
				success: false,
				message: "You can only rate completed appointments.",
			})
		}

		// Check if the appointment already has a rating
		if (appointment.rating) {
			return res.status(400).json({
				success: false,
				message: "You have already rated this appointment.",
			})
		}

		// Update the appointment with the rating
		appointment.rating = rating
		await appointment.save()

		// Find the doctor
		const doctor = await doctorModel.findById(appointment.docId)

		if (doctor) {
			// Calculate the new average rating and total ratings
			const totalRatings = doctor.ratings.count + 1
			const newAverageRating =
				(doctor.ratings.average * doctor.ratings.count + rating) / totalRatings

			// Update the doctor's ratings
			doctor.ratings.average = newAverageRating
			doctor.ratings.count = totalRatings
			await doctor.save()
		}

		// Create a new rating document
		const newRating = new ratingModel({
			docId: appointment.docId,
			patientId: appointment.userId,
			appointmentId: appointment._id, // Save the appointment ID
			rating: rating,
			comment: comment || null,
		})
		await newRating.save()

		// Return success response
		return res.status(200).json({
			success: true,
			message: "Thank you for rating the doctor!",
		})
	} catch (error) {
		console.error("Error submitting rating:", error.message)
		return res.status(500).json({
			success: false,
			message: "An error occurred while submitting the rating.",
		})
	}
}

const getDoctorRatings = async (req, res) => {
	try {
		const { docId } = req.params // Doctor ID from the request parameters

		// Validate the doctor ID
		if (!docId) {
			return res.status(400).json({
				success: false,
				message: "Doctor ID is required.",
			})
		}

		// Fetch all ratings for the doctor
		const ratings = await ratingModel.find({ docId }).populate({
			path: "patientId",
			select: "name email image", // Include patient details
		})
		// .populate({
		// 	path: "appointmentId",
		// 	select: "userData docData", // Include appointment details
		// })

		// If no ratings are found
		if (ratings.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No ratings found for this doctor.",
			})
		}

		// Format the response
		// const formattedRatings = ratings.map((rating) => ({
		// 	rating: rating.rating,
		// 	comment: rating.comment,
		// 	patient: {
		// 		name: rating.patientId.name,
		// 		email: rating.patientId.email,
		// 		image: rating.patientId.image,
		// 	},
		// 	// appointment: {
		// 	// 	// date: rating.appointmentId.slotDate,
		// 	// 	// time: rating.appointmentId.slotTime,
		// 	// 	userData: rating.appointmentId.userData,
		// 	// 	// docData: rating.appointmentId.docData,
		// 	// },
		// }))
		// console.log(formattedRatings)
		// Return the ratings
		return res.status(200).json({
			success: true,
			// ratings: formattedRatings,
			ratings,
		})
	} catch (error) {
		console.error("Error fetching doctor ratings:", error.message)
		return res.status(500).json({
			success: false,
			message: "An error occurred while fetching doctor ratings.",
		})
	}
}

const searchDoctors = async (req, res) => {
	try {
		const { query } = req.query // Search query (e.g., name, speciality, location, etc.)

		// Validate the query
		if (!query || typeof query !== "string" || query.trim() === "") {
			return res.status(400).json({
				success: false,
				message: "Search query is required and must be a non-empty string.",
			})
		}

		// Build the search criteria
		const searchCriteria = {
			$or: [
				{ name: { $regex: query, $options: "i" } }, // Case-insensitive search for name
				{ speciality: { $regex: query, $options: "i" } }, // Case-insensitive search for speciality
				// Add more fields here if needed (e.g., hospital, qualifications, etc.)
			],
		}

		// Find doctors matching the search criteria
		const doctors = await doctorModel
			.find(searchCriteria)
			.select("-password") // Exclude password field
			.limit(20) // Limit the results to 20 doctors (optional)

		// Return the search results
		return res.status(200).json({
			success: true,
			doctors,
		})
	} catch (error) {
		console.error("Error searching doctors:", error.message)
		return res.status(500).json({
			success: false,
			message: "An error occurred while searching for doctors.",
		})
	}
}

export {
	registerUser,
	loginUser,
	getProfile,
	updateProfile,
	bookAppointment,
	appointmentDetails,
	specialityList,
	doctorList,
	topDoctorsList,
	favoriteDoctorsList,
	addFavorite,
	deleteFavorite,
	appointmentList,
	cancelAppointment,
	handlePayment,
	verifyStripepay,
	rateDoctor,
	getDoctorRatings,
	searchDoctors,
}
