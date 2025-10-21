import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./config/mongodb.js"
import connectCloudindary from "./config/cloudinary.js"
import adminRouter from "./routes/adminRoute.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudindary()

// middlewares
app.use(express.json())
// app.use(cors())
app.use(
	cors({
		origin: ["http://localhost:3000"], // Allow only requests from this frontend domain
		methods: "GET,POST,PUT,DELETE",
		credentials: true, // Allow credentials (cookies, authorization headers, etc.)
	})
)

// api endpoints
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/user", userRouter)

app.get("/", (req, res) => {
	res.send("API IS WORKING")
})

app.listen(port, () => console.log("Server Started", port))
