import mongoose from "mongoose"

const ratingSchema = new mongoose.Schema(
	{
		docId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "doctor",
			required: true,
		},
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		appointmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "appointment",
			required: true,
		},
		rating: { type: Number, min: 1, max: 5, required: true }, // Individual rating
		comment: { type: String, default: null },
	},
	{ timestamps: true }
)

const ratingModel =
	mongoose.models.rating || mongoose.model("rating", ratingSchema)

export default ratingModel
