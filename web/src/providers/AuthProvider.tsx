// components/ClientProvider.tsx
"use client" // Mark this as a Client Component

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface AuthProviderProps {
	children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
	return <SessionProvider>{children}</SessionProvider>
}

export default AuthProvider
