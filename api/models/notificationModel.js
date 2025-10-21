import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
	{
		docId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "doctor",
			required: true,
		},
		appointmentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "appointment",
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		read: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String,
			enum: [
				"appointment",
				"rating",
				// "message",
				// "system",
				// "earnings",
				// "other",
			],
			default: "other",
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed, // Flexible field for additional data
		},
	},
	{ timestamps: true }
)

const notificationModel =
	mongoose.models.notification ||
	mongoose.model("notification", notificationSchema)

export default notificationModel
