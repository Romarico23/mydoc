import { useMutation, useQueryClient } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import {
	cancelAppointment,
	handlePayment,
	verifyStripepay,
	rateDoctor,
} from "@/lib/services/api"
import { Alert } from "react-native"
import { AppointmentPaymentData } from "@/lib/types/types"
import { useModalState } from "./useModalState"

export const useCancelAppointment = () => {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (appointmentId: string) =>
			cancelAppointment(appointmentId, axiosAuth),
		onSuccess: (data, variables) => {
			const appointmentId = variables
			Alert.alert(data.title, data.message)
			queryClient.invalidateQueries({ queryKey: ["appointmentList"] })
			queryClient.invalidateQueries({
				queryKey: ["appointmentDetails", appointmentId],
			})
		},
		onError: (error: any) => {
			Alert.alert(
				"Cancellation Failed",
				error?.response?.data?.message || "Something went wrong."
			)
		},
	})
}

export const useHandlePayment = () => {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (appointmentPaymentData: AppointmentPaymentData) =>
			handlePayment(appointmentPaymentData, axiosAuth),
		onSuccess: (data, variables) => {
			const appointmentId = variables.appointmentId
			Alert.alert(data.title, data.message)
			queryClient.invalidateQueries({ queryKey: ["appointmentList"] })
			queryClient.invalidateQueries({
				queryKey: ["appointmentDetails", appointmentId],
			})
		},
		onError: (error: any) => {
			Alert.alert(
				"Payment Failed",
				error?.response?.data?.message || "Something went wrong."
			)
		},
	})
}

// Mutation for verifying Stripe payment
export const useVerifyStripepay = () => {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (appointmentId: string) =>
			verifyStripepay(appointmentId, axiosAuth),
		onSuccess: (data, variables) => {
			const appointmentId = variables
			console.log("Stripe payment verified successfully", data)
			queryClient.invalidateQueries({ queryKey: ["appointmentList"] })
			queryClient.invalidateQueries({
				queryKey: ["appointmentDetails", appointmentId],
			})
		},
		onError: (error: any) => {
			Alert.alert(
				"Booking Failed",
				error?.response?.data?.message || "Something went wrong."
			)
		},
	})
}

export const useRateDoctor = () => {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			appointmentId,
			rating,
			comment,
		}: {
			appointmentId: string
			rating: number
			comment: string
		}) => rateDoctor(appointmentId, rating, comment, axiosAuth),
		onSuccess: (data, variables) => {
			const appointmentId = variables.appointmentId
			Alert.alert("Thank you!", "Your rating has been submitted.")
			queryClient.invalidateQueries({ queryKey: ["appointmentList"] })
			queryClient.invalidateQueries({
				queryKey: ["appointmentDetails", appointmentId],
			})
		},
		onError: (error: any) => {
			Alert.alert(
				"Rating Failed",
				error?.response?.data?.message || "Something went wrong."
			)
		},
	})
}
