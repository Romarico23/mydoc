import { QueryObserverResult } from "@tanstack/react-query"
import { useCallback } from "react"

// Define the type for refetch functions
type RefetchFunction = () => Promise<QueryObserverResult<any, Error>>

export const useRefreshData = (refetchFunctions: RefetchFunction[]) => {
	const onRefresh = useCallback(async () => {
		try {
			// Execute all refetch functions passed to the hook
			await Promise.all(refetchFunctions.map((refetch) => refetch()))
		} catch (error) {
			console.error("Error refreshing data:", error)
			throw error // Re-throw the error if needed
		}
	}, [refetchFunctions])

	return { onRefresh }
}
