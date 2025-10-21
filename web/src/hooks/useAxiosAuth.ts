import { useSession } from "next-auth/react"
import React, { useEffect } from "react"
import axios from "@/lib/services/axios"

const useAxiosAuth = () => {
	const { data: session } = useSession()

	useEffect(() => {
		const requestIntercept = axios.interceptors.request.use((config) => {
			if (!config.headers["Authorization"]) {
				// config.headers["Authorization"] = `Bearer ${
				// 	session?.user.aToken || session?.user.dToken
				// }`
				const token =
					session?.user.role === "admin"
						? session?.user.aToken
						: session?.user.dToken
				config.headers["Authorization"] = `Bearer ${token}`
			}
			return config
		})
		return () => {
			axios.interceptors.request.eject(requestIntercept)
		}
	}, [session])

	return axios
}

export default useAxiosAuth

// import { useSession } from "next-auth/react"
// import React, { useEffect } from "react"
// import axios from "@/lib/services/axios"

// const useAxiosAuth = () => {
// 	const { data: session } = useSession()

// 	useEffect(() => {
// 		const requestIntercept = axios.interceptors.request.use((config) => {
// 			if (!config.headers["Authorization"] && session?.user) {
// 				const token =
// 					session.user.role === "admin"
// 						? session.user.aToken
// 						: session.user.dToken
// 				config.headers["Authorization"] = `Bearer ${token}`
// 			}
// 			return config
// 		})
// 		return () => {
// 			axios.interceptors.request.eject(requestIntercept)
// 		}
// 	}, [session])

// 	return axios
// }

// export default useAxiosAuth
