import mongoose from "mongoose"

const connectDB = async () => {
	const uri = process.env.MONGODB_URI

	if (!uri) {
		throw new Error("MONGODB_URI is not defined in environment variables")
	}

	try {
		await mongoose.connect(`${uri}/mydoc`) // No need to specify useNewUrlParser or useUnifiedTopology
		console.log("Connected to Database")
	} catch (error) {
		console.error("Error connecting to database:", error)
		throw error // Rethrow the error to handle it further if needed
	}
}

export default connectDB
