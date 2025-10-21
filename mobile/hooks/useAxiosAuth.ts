import React, { useEffect } from "react"
import axios from "@/lib/services/config"
import * as SecureStore from "expo-secure-store"

const useAxiosAuth = () => {
	useEffect(() => {
		const requestIntercept = axios.interceptors.request.use(async (config) => {
			// Get the token from SecureStore
			const token = await SecureStore.getItemAsync("jwtToken")

			// If there's a token, add it to the request headers
			if (token && !config.headers["Authorization"]) {
				config.headers["Authorization"] = `Bearer ${token}`
			}

			return config
		})

		// Clean up the interceptor when the component is unmounted
		return () => {
			axios.interceptors.request.eject(requestIntercept)
		}
	}, [])

	return axios
}

export default useAxiosAuth
