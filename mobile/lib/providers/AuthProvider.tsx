import React, { useEffect, useState } from "react"
import * as SecureStore from "expo-secure-store"
import { useRouter, usePathname } from "expo-router"
import LoadingScreen from "@/components/common/LoadingScreen"

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isTokenPresent, setIsTokenPresent] = useState<boolean | null>(null)
	const router = useRouter()
	const currentPath = usePathname()

	useEffect(() => {
		const checkToken = async () => {
			const token = await SecureStore.getItemAsync("jwtToken")
			setIsTokenPresent(!!token)

			// Immediate navigation logic
			if (token && currentPath === "/") {
				router.replace("/home")
			} else if (
				!token &&
				currentPath !== "/" &&
				currentPath !== "/login" &&
				currentPath !== "/register"
			) {
				router.replace("/")
			}
		}

		checkToken()
	}, [currentPath, router, isTokenPresent])

	// Show a loading spinner or nothing while checking the token
	if (isTokenPresent === null) {
		return <LoadingScreen />
	}

	return <>{children}</>
}

export default AuthProvider
