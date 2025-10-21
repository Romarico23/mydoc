import { useMemo } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AuthProvider from "./AuthProvider"

function TanstackProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useMemo(() => new QueryClient(), [])

	return (
		<QueryClientProvider client={queryClient}>
			{/* <AuthProvider>{children}</AuthProvider> */}
			{children}
		</QueryClientProvider>
	)
}

export default TanstackProvider
