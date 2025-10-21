import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		image: {
			type: String,
			default: "",
		},
		address: { type: Object, default: { line1: "", line2: "" } },
		gender: { type: String, default: "Select Gender" },
		birthDate: { type: String, default: "Select Birth Date" },
		phone: { type: String, default: "000000000" },
		favorites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "doctor", // Reference to the Doctor model
			},
		],
	},
	{ timestamps: true }
)

const userModel = mongoose.models.user || mongoose.model("user", userSchema)

export default userModel
