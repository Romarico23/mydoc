"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import LoadingPage from "@/components/ui/loadingPage"
import useAutoLogout from "@/hooks/useAutoLogout"
import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { checkingAdminAuth } from "@/lib/services/adminApi"
import axios from "axios"

interface ClientSessionWrapperProps {
	children: React.ReactNode
}

interface AdminAuthProps {
	status: number
}

const ClientSessionWrapper: React.FC<ClientSessionWrapperProps> = ({
	children,
}) => {
	const { data: session, status } = useSession()
	const router = useRouter()
	const axiosAuth = useAxiosAuth()
	const [isMounted, setIsMounted] = useState(false)

	useAutoLogout()

	// Ensure the component is only evaluated on the client side
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Fetch admin auth only if authenticated
	const {
		data: adminAuth,
		isLoading: adminAuthIsLoading,
		isError: adminAuthError,
	} = useQuery<AdminAuthProps>({
		queryFn: () => checkingAdminAuth(axiosAuth),
		queryKey: ["adminAuth"],
		enabled: status === "authenticated",
	})

	// Redirect if unauthenticated or admin auth fails
	useEffect(() => {
		if (isMounted) {
			if (status === "unauthenticated" && !session) {
				// Redirect unauthenticated users
				const currentRoute = window.location.pathname
				router.replace(
					currentRoute.startsWith("/admin") ? "/admin/login" : "/doctor/login"
				)
			} else if (status === "authenticated" && adminAuthError) {
				// Redirect if admin auth check fails
				router.replace("/admin/login")
			}
		}
	}, [status, session, isMounted, adminAuthError, router])

	// Axios interceptor for handling unauthorized requests
	useEffect(() => {
		const requestInterceptor = axios.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					router.push("/admin/login") // Redirect to login if unauthorized
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
		(status === "authenticated" && adminAuthIsLoading)
	) {
		return <LoadingPage />
	}

	// Only render children if authenticated and admin auth is confirmed
	if (status === "authenticated" && !adminAuthIsLoading && !adminAuthError) {
		return <>{children}</>
	}

	// Default to loading state
	return <LoadingPage />
}

export default ClientSessionWrapper
