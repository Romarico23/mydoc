import jwt from "jsonwebtoken"

// Doctor authentication middleware
const authDoctor = async (req, res, next) => {
	try {
		// Extract the token from the Authorization header
		const dToken = req.headers.authorization?.split(" ")[1] // "Bearer token"

		// Check if token is provided
		if (!dToken) {
			return res
				.status(401)
				.json({ success: false, message: "Unauthorized: No token provided" })
		}

		// Verify the token
		const dToken_decode = jwt.verify(dToken, process.env.JWT_SECRET)

		req.body.docId = dToken_decode.id

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

export default authDoctor
