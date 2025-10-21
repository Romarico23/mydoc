import { View, Text, TouchableOpacity, Alert, Image } from "react-native"
import React from "react"
import {
	AppointmentPaymentData,
	AppointmentsCardProps,
} from "@/lib/types/types"
import { convertToAmPmFormat, formatDate } from "@/lib/utils"
import { Entypo, MaterialIcons } from "@expo/vector-icons"
import {
	useCancelAppointment,
	useHandlePayment,
	useVerifyStripepay,
} from "@/hooks/useAppointmentMutations"
import { useModalState } from "@/hooks/useModalState"
import { useStripePayment } from "@/hooks/useStripePayment"
import { useQueryClient } from "@tanstack/react-query"

interface AppointmentCardItemProps {
	appointment: AppointmentsCardProps
	modalVisible: boolean
	onToggleModal: () => void
	onRateDoctor: () => void
	onPressNavigate: () => void
}

export const AppointmentCardItem = ({
	appointment,
	modalVisible,
	onToggleModal,
	onRateDoctor,
	onPressNavigate,
}: AppointmentCardItemProps) => {
	// Mutation for canceling an appointment
	const cancelMutation = useCancelAppointment()

	// Mutation for handling Payment
	const handlePaymentMutation = useHandlePayment()
	const verifyStripepayMutation = useVerifyStripepay()

	const { setModalVisibleMap } = useModalState()

	const handleStripePaymentMutation = useStripePayment({
		handlePaymentMutation,
		verifyStripepayMutation,
	})

	// Handle option selection (cancel, card payment, cash payment)
	const handleOptionSelect = (option: string, appointmentId: string) => {
		setModalVisibleMap((prev) => ({ ...prev, [appointmentId]: false }))

		const appointmentPaymentData: AppointmentPaymentData = {
			appointmentId,
			paymentMethod: option,
		}

		switch (option) {
			case "cancel":
				cancelMutation.mutate(appointmentId)
				break
			case "card":
				handleStripePaymentMutation.handleStripePayment(appointmentPaymentData)
				break
			case "cash":
				handlePaymentMutation.mutate(appointmentPaymentData)
				break
			default:
				Alert.alert("Invalid Option", "Please select a valid action.")
		}
	}

	const {
		cancelled: isCancelled,
		isCompleted,
		cardPayment: isPaidByCard,
		cashPayment: isPaidByCash,
		rating: isRated,
		docData,
		slotDate,
		slotTime,
	} = appointment

	return (
		<TouchableOpacity onPress={onPressNavigate}>
			<View
				className={`relative flex-row items-center bg-white py-2 border-b-2 ${
					isCancelled
						? "opacity-50"
						: isCompleted && isRated
						? "opacity-80"
						: ""
				}`}
			>
				<Image
					source={{ uri: docData.image }}
					className="w-20 h-20 mr-4"
					alt={`${docData.name}'s profile`}
				/>
				<View className="flex-1">
					<Text className="text-base font-semibold">{docData.name}</Text>
					<Text>{docData.speciality}</Text>
					<Text>
						{formatDate(slotDate)} | {convertToAmPmFormat(slotTime)}
					</Text>
					<Text>
						Address: {docData.address.line1}, {docData.address.line2}
					</Text>

					{isCancelled && (
						<Text className="text-red-500 font-semibold mt-1">
							Appointment Cancelled
						</Text>
					)}
					{isCompleted && (
						<Text className="text-green-500 font-semibold mt-1">
							Appointment Completed
						</Text>
					)}
					{(isPaidByCard || isPaidByCash) && (
						<Text className="text-green-500 font-semibold mt-1">
							Paid {isPaidByCard ? "by Card" : "by Cash"}
						</Text>
					)}
					{isCompleted && !isRated && (
						<TouchableOpacity
							onPress={onRateDoctor}
							className="bg-blue-500 p-2 rounded mt-2"
						>
							<Text className="text-white text-center">Rate Doctor</Text>
						</TouchableOpacity>
					)}
					{isRated && (
						<View className="flex-row items-center">
							{[1, 2, 3, 4, 5].map((star) => (
								<MaterialIcons
									key={star}
									name={isRated >= star ? "star" : "star-border"}
									size={20}
									color={isRated >= star ? "#FFD700" : "#CCCCCC"}
								/>
							))}
						</View>
					)}
				</View>

				{!isCancelled && !isPaidByCard && !isPaidByCash && !isCompleted && (
					<TouchableOpacity
						onPress={onToggleModal}
						className="absolute right-0 top-3 p-2"
					>
						<Entypo name="dots-three-vertical" size={16} color="black" />
					</TouchableOpacity>
				)}

				{modalVisible &&
					!isCompleted &&
					!isCancelled &&
					!isPaidByCard &&
					!isPaidByCash && (
						<View className="absolute right-8 bottom-0 flex-1">
							<View className="bg-gray-300 rounded-lg w-44">
								{["cancel", "card", "cash"].map((option) => (
									<TouchableOpacity
										key={option}
										className="p-1 ml-2"
										onPress={() => handleOptionSelect(option, appointment._id)}
									>
										<Text className="text-base">
											{option === "cancel"
												? "Cancel Appointment"
												: `${
														option.charAt(0).toUpperCase() + option.slice(1)
												  } Payment`}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					)}
			</View>
		</TouchableOpacity>
	)
}
