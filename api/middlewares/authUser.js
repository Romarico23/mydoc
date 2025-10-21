import jwt from "jsonwebtoken"

// User authentication middleware
const authUser = async (req, res, next) => {
	try {
		// Extract the token from the Authorization header
		const token = req.headers.authorization?.split(" ")[1] // "Bearer token"

		// Check if token is provided
		if (!token) {
			return res
				.status(401)
				.json({ success: false, message: "Unauthorized: No token provided" })
		}

		// Verify the token
		const token_decode = jwt.verify(token, process.env.JWT_SECRET)

		req.body.userId = token_decode.id
		return next()
	} catch (error) {
		console.error(error)

		// Return server error status if token verification fails or any other error occurs
		return res
			.status(500)
			.json({ success: false, message: "Server Error. Please try again." })
	}
}

export default authUser
