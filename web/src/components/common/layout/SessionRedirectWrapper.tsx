"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LoadingPage from "@/components/ui/loadingPage"

interface SessionRedirectWrapperProps {
	children: React.ReactNode
}

const SessionRedirectWrapper: React.FC<SessionRedirectWrapperProps> = ({
	children,
}) => {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [isMounted, setIsMounted] = useState(false)

	// Ensure this runs on the client side
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Redirect if authenticated (admin token exists)
	// useEffect(() => {
	// 	if (isMounted && status === "authenticated") {
	// 		session?.user.role === "admin"
	// 			? router.push("/admin/dashboard")
	// 			: router.push("/doctor/dashboard")
	// 	}
	// }, [status, isMounted, router])
	useEffect(() => {
		if (isMounted && status === "authenticated") {
			if (session?.user?.aToken && session?.user.role === "admin") {
				router.push("/admin/dashboard")
			} else if (session?.user?.dToken && session?.user.role === "doctor") {
				router.push("/doctor/dashboard")
			} else {
				router.push("/doctor/login")
			}
		}
	}, [status, isMounted, router, session])

	// Prevent rendering while loading session or before mounting
	if (!isMounted || status === "loading" || session) {
		// Optionally return a loading spinner or just null
		return <LoadingPage />
	}

	// Render children if not authenticated
	if (status === "unauthenticated") {
		return <>{children}</>
	}
}

export default SessionRedirectWrapper
