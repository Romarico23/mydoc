"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

const Card403: React.FC = () => {
	const router = useRouter()
	const { data: session, status } = useSession()

	useEffect(() => {
		const timer = setTimeout(() => {
			if (status === "authenticated") {
				if (session?.user?.aToken && session?.user.role === "admin") {
					router.push("/admin/dashboard")
				} else if (session?.user?.dToken && session?.user.role === "doctor") {
					router.push("/doctor/dashboard")
				} else {
					// router.push("/")
					router.back()
				}
			}
			// router.back
		}, 5000)

		return () => clearTimeout(timer)
	}, [router, session, status])

	useEffect(() => {
		document.title = "Page403"
	}, [])

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-2xl font-bold mb-4">Page 403 | Forbidden</h1>
			<p className="text-lg text-center">
				Access Denied! You do not have the necessary permissions.
			</p>
		</div>
	)
}

export default Card403
