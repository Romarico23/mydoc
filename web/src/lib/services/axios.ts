import axios from "axios"

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_URL
axios.defaults.headers.post["Content-Type"] = "application/json"
axios.defaults.headers.post["Accept"] = "application/json"
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

export default axios
