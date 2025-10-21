import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"

const useAutoLogout = () => {
	const { data: session, status } = useSession()

	useEffect(() => {
		// Only run if session exists and status is authenticated
		if (session && session.expires && status === "authenticated") {
			// Convert session expiration string to Date object
			const expirationTime = new Date(session.expires).getTime()

			// Check expiration immediately on load
			if (expirationTime < Date.now()) {
				signOut() // Force logout if already expired
			} else {
				// Set an interval to keep checking for expiration
				const intervalId = setInterval(() => {
					const currentTime = Date.now()

					if (expirationTime < currentTime) {
						// Token is expired, so force logout
						signOut()
					}
				}, 1000) // Check every second
				return () => clearInterval(intervalId) // Clean up interval on unmount
			}
		}
	}, [session, status]) // Add status as a dependency
}

export default useAutoLogout
