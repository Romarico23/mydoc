"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import LoadingPage from "@/components/ui/loadingPage"
import useAutoLogout from "@/hooks/useAutoLogout"
import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { checkingDoctorAuth } from "@/lib/services/doctorApi"
import axios from "axios"

interface ClientSessionWrapperProps {
	children: React.ReactNode
}

interface DoctorAuthProps {
	status: number
}

const ClientSessionWrapper: React.FC<ClientSessionWrapperProps> = ({
	children,
}) => {
	const { data: session, status } = useSession()
	const router = useRouter()
	const axiosAuth = useAxiosAuth()

	// Auto logout hook
	useAutoLogout()

	// Fetch doctor auth only if authenticated
	const {
		data: doctorAuth,
		isLoading: doctorAuthIsLoading,
		isError: doctorAuthError,
	} = useQuery<DoctorAuthProps>({
		queryFn: () => checkingDoctorAuth(axiosAuth),
		queryKey: ["doctorAuth"],
		enabled: status === "authenticated", // Only run if authenticated
	})

	// Redirect if unauthenticated
	useEffect(() => {
		if (status === "unauthenticated" && !session) {
			const currentRoute = window.location.pathname
			router.replace(
				currentRoute.startsWith("/doctor") ? "/doctor/login" : "/admin/login"
			)
		} else if (status === "authenticated" && doctorAuthError) {
			// Redirect if admin auth check fails
			router.replace("/doctor/login")
		}
	}, [status, session, router])

	// Axios interceptor for handling unauthorized requests
	useEffect(() => {
		const requestInterceptor = axios.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					router.push("/doctor/login") // Redirect to login if unauthorized
				} else if (error.response?.status === 403) {
					router.push("/403") // Redirect to 403 page if forbidden
				}
				return Promise.reject(error)
			}
		)

		// Cleanup the interceptor on component unmount
		return () => {
			axios.interceptors.response.eject(requestInterceptor)
		}
	}, [router])

	// Prevent rendering while loading or if there's an error
	if (
		status === "loading" ||
		(status === "authenticated" && doctorAuthIsLoading)
	) {
		return <LoadingPage />
	}

	// Only render children if authenticated and doctor auth is confirmed
	if (status === "authenticated" && !doctorAuthIsLoading && !doctorAuthError) {
		return <>{children}</>
	}

	// Default to loading state
	return <LoadingPage />
}

export default ClientSessionWrapper
