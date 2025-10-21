import axios from "axios"
import Constants from "expo-constants" // Use expo-constants to access the env variable

// Assuming EXPO_PUBLIC_SERVER_URL is correctly set in app.json
// axios.defaults.baseURL =
// 	Constants.manifest2.extra.serverUrl || "http://localhost:4000"
axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_URL
axios.defaults.headers.post["Content-Type"] = "application/json"
axios.defaults.headers.post["Accept"] = "application/json"
axios.defaults.withCredentials = true // Ensure credentials are sent with requests if required
axios.defaults.withXSRFToken = true

export default axios
