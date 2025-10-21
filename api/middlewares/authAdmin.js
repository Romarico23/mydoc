import jwt from "jsonwebtoken"

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
	try {
		// Extract the token from the Authorization header
		const aToken = req.headers.authorization?.split(" ")[1] // "Bearer token"

		// Check if token is provided
		if (!aToken) {
			return res
				.status(401)
				.json({ success: false, message: "Unauthorized: No token provided" })
		}

		// Verify the token
		const aToken_decode = jwt.verify(aToken, process.env.JWT_SECRET)

		// Check if decoded token matches the admin credentials
		if (aToken_decode.email !== process.env.ADMIN_EMAIL) {
			return res
				.status(403)
				.json({ success: false, message: "Not Authorized. Login Again" })
		}

		// Proceed to the next middleware if authorized
		return next()
	} catch (error) {
		console.error(error)

		// Return server error status if token verification fails or any other error occurs
		return res
			.status(500)
			.json({ success: false, message: "Server Error. Please try again." })
	}
}

export default authAdmin
