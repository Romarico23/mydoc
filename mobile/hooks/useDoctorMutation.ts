import { useMutation, useQueryClient } from "@tanstack/react-query"
import useAxiosAuth from "./useAxiosAuth"
import { addFavorite, deleteFavorite } from "@/lib/services/api"
import { Alert } from "react-native"

export const useAddFavorite = () => {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (docId: string) => addFavorite(docId, axiosAuth),
		onMutate: async (docId: string) => {
			await queryClient.cancelQueries({ queryKey: ["userProfile"] })

			const previousUser = queryClient.getQueryData(["userProfile"])

			queryClient.setQueryData(["userProfile"], (old: any) => ({
				...old,
				favorites: [...(old?.favorites || []), docId],
			}))

			return { previousUser }
		},
		onSuccess: (data) => {
			// Alert.alert(data.title, data.message)
			queryClient.invalidateQueries({ queryKey: ["favoriteDoctorsList"] })
			queryClient.invalidateQueries({ queryKey: ["userProfile"] })
		},
		onError: (error: any, docId, context) => {
			queryClient.setQueryData(["userProfile"], context?.previousUser)

			Alert.alert(
				"Failed to Add Favorite",
				error?.response?.data?.message ||
					"An error occurred while adding the doctor to favorites."
			)
		},
		// onSettled: () => {
		// 	queryClient.invalidateQueries({ queryKey: ["userProfile"] })
		// },
	})
}

export const useDeleteFavorite = () => {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (docId: string) => deleteFavorite(docId, axiosAuth),
		onMutate: async (docId: string) => {
			await queryClient.cancelQueries({ queryKey: ["userProfile"] })

			const previousUser = queryClient.getQueryData(["userProfile"])

			queryClient.setQueryData(["userProfile"], (old: any) => ({
				...old,
				favorites: old?.favorites?.filter((fav: string) => fav !== docId) || [],
			}))

			return { previousUser }
		},
		onSuccess: (data) => {
			// Alert.alert(data.title, data.message)
			queryClient.invalidateQueries({ queryKey: ["favoriteDoctorsList"] })
			queryClient.invalidateQueries({ queryKey: ["userProfile"] })
		},
		onError: (error: any, docId, context) => {
			queryClient.setQueryData(["userProfile"], context?.previousUser)

			Alert.alert(
				"Failed to Remove Favorite",
				error?.response?.data?.message ||
					"An error occurred while removing the doctor from favorites."
			)
		},
		// onSettled: () => {
		// 	queryClient.invalidateQueries({ queryKey: ["userProfile"] })
		// },
	})
}
