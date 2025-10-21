import mongoose from "mongoose"

const specialitySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		description: { type: String },
		status: { type: Boolean, default: true },
		image: { type: String, required: true },
	},
	{ timestamps: true }
)

const specialityModel =
	mongoose.models.speciality || mongoose.model("speciality", specialitySchema)

export default specialityModel
