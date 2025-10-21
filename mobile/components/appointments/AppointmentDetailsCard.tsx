import React from "react"
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native"
import { useLocalSearchParams } from "expo-router"
import { FontAwesome, MaterialIcons } from "@expo/vector-icons" // For icons
import { convertToAmPmFormat, formatDate } from "@/lib/utils"
import {
	useCancelAppointment,
	useHandlePayment,
	useRateDoctor,
	useVerifyStripepay,
} from "@/hooks/useAppointmentMutations"
import { useStripePayment } from "@/hooks/useStripePayment"
import { useModalState } from "@/hooks/useModalState"
import { AppointmentPaymentData } from "@/lib/types/types"
import { useAppointmentDetails } from "@/hooks/useAppointments"
import LoadingScreen from "../common/LoadingScreen"
import ErrorFetching from "../common/ErrorFetching"
import { RatingModal } from "./RatingModal"

export default function AppointmentDetailsCard() {
	const { appointmentId } = useLocalSearchParams()

	// Fetch appointmentDetails
	const {
		data: viewAppointmentDetails,
		isLoading,
		isError,
		refetch,
	} = useAppointmentDetails(String(appointmentId))

	const appointment = viewAppointmentDetails?.appointment

	const {
		ratingModalVisible,
		selectedAppointmentId,
		openRatingModal,
		setRatingModalVisible,
	} = useModalState()

	// Mutation for canceling an appointment
	const cancelMutation = useCancelAppointment()

	// Mutation for handling Payment
	const handlePaymentMutation = useHandlePayment()
	const verifyStripepayMutation = useVerifyStripepay()
	const handleStripePaymentMutation = useStripePayment({
		handlePaymentMutation,
		verifyStripepayMutation,
	})

	// Mutation for rating a doctor
	const rateDoctorMutation = useRateDoctor()

	// Submit rating
	const submitRating = (rating: number, comment?: string) => {
		if (selectedAppointmentId && rating !== null && rating > 0) {
			rateDoctorMutation.mutate(
				{
					appointmentId: selectedAppointmentId,
					rating: rating,
					comment: comment || "", // Include comment, default to empty string if not provided
				},
				{
					onSuccess: () => {
						setRatingModalVisible(false) // Close the modal after success
					},
				}
			)
		} else {
			Alert.alert(
				"Invalid Rating",
				"Please select a rating between 1 and 5 stars."
			)
		}
	}

	const handleOptionSelect = (option: string, appointmentId: string) => {
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

	// Check if any action button should be displayed
	const showActions =
		(appointment?.isCompleted && !appointment?.rating) || // Rate Doctor
		(!appointment?.isCompleted &&
			!appointment?.cancelled &&
			!appointment?.cardPayment &&
			!appointment?.cashPayment) // Payment or Cancel

	// Render loading or error screens
	if (isLoading) return <LoadingScreen />
	if (isError) return <ErrorFetching />

	return (
		<View className="flex-1 bg-gray-100">
			{/* Top Section with Blue Background */}
			<View className="bg-blue-500 items-center pb-6">
				{/* Doctor Image */}
				<View className="w-40 h-40 rounded-full overflow-hidden border-4 border-white mt-8">
					<Image
						source={{ uri: appointment?.docData.image }}
						className="w-full h-full object-cover"
					/>
				</View>
				{/* Doctor Name */}
				<Text className="text-2xl font-bold text-white mt-4">
					{appointment?.docData.name}
				</Text>
				{/* Rating */}
				{appointment?.rating ? (
					<View className="flex-row items-center">
						{[1, 2, 3, 4, 5].map((star) => (
							<MaterialIcons
								key={star}
								name={appointment?.rating >= star ? "star" : "star-border"}
								size={20}
								color={appointment?.rating >= star ? "#FFD700" : "#CCCCCC"}
							/>
						))}
					</View>
				) : (
					<Text className="text-gray-100 italic mt-1">No rating yet</Text>
				)}
			</View>

			{/* Bottom Section with Appointment Details */}
			<ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
				{/* Appointment Details Card */}
				<View className="bg-white rounded-lg p-6 mt-6 shadow-sm">
					<Text className="text-xl font-bold mb-4">Appointment Details</Text>

					{/* Date and Time */}
					<View className="space-y-2">
						<View className="flex flex-row items-center">
							<MaterialIcons name="date-range" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								Date: {formatDate(appointment?.slotDate)}
							</Text>
						</View>
						<View className="flex flex-row items-center">
							<MaterialIcons name="access-time" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								Time: {convertToAmPmFormat(appointment?.slotTime)}
							</Text>
						</View>
					</View>

					{/* Divider */}
					<View className="border-b border-gray-200 my-4" />

					{/* Payment Status */}
					<View className="space-y-2">
						<Text className="text-lg font-semibold">Payment Details</Text>
						<View className="flex flex-row items-center">
							<MaterialIcons name="payment" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								Amount: ${appointment?.amount}
							</Text>
						</View>
						<View className="flex flex-row items-center">
							<MaterialIcons name="credit-card" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								Payment Method:{" "}
								{appointment?.cardPayment
									? "Credit Card"
									: appointment?.cashPayment
									? "Cash"
									: "Not Specified"}
							</Text>
						</View>
					</View>

					{/* Divider */}
					<View className="border-b border-gray-200 my-4" />

					{/* Appointment Status */}
					<View className="space-y-2">
						<Text className="text-lg font-semibold">Appointment Status</Text>
						<View className="flex flex-row items-center">
							<MaterialIcons
								name={
									appointment?.isCompleted
										? "check-circle"
										: appointment?.cancelled
										? "cancel"
										: "schedule"
								}
								size={20}
								color={
									appointment?.isCompleted
										? "#38A169"
										: appointment?.cancelled
										? "#E53E3E"
										: "#4A5568"
								}
							/>
							<Text className="text-base ml-2">
								{appointment?.isCompleted
									? "Completed"
									: appointment?.cancelled
									? "Cancelled"
									: "Scheduled"}
							</Text>
						</View>
					</View>

					{/* Divider */}
					<View className="border-b border-gray-200 my-4" />

					{/* Doctor's Details */}
					<View className="space-y-2">
						<Text className="text-lg font-semibold">Doctor's Details</Text>
						<View className="flex flex-row items-center">
							<MaterialIcons name="local-hospital" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								{appointment?.docData.degree} -{" "}
								{appointment?.docData.speciality}
							</Text>
						</View>
						<View className="flex flex-row items-center">
							<MaterialIcons name="update" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								{appointment?.docData.experience}
							</Text>
						</View>
						<View className="flex flex-row items-center">
							<MaterialIcons name="email" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								{appointment?.docData.email}
							</Text>
						</View>
						<View className="flex flex-row items-center">
							<MaterialIcons name="location-pin" size={20} color="#4A5568" />
							<Text className="text-base ml-2">
								{appointment?.docData.address.line1},{" "}
								{appointment?.docData.address.line2}
							</Text>
						</View>
					</View>
				</View>

				{/* User Details Card */}
				<View className="bg-white rounded-lg p-6 mt-6 shadow-sm">
					<Text className="text-xl font-bold mb-4">Patient Details</Text>

					{/* User Name */}
					<View className="flex flex-row items-center">
						<MaterialIcons name="person" size={20} color="#4A5568" />
						<Text className="text-base ml-2">
							Name: {appointment?.userData.name}
						</Text>
					</View>

					{/* User Email */}
					<View className="flex flex-row items-center mt-2">
						<MaterialIcons name="email" size={20} color="#4A5568" />
						<Text className="text-base ml-2">
							Email: {appointment?.userData.email}
						</Text>
					</View>

					{/* User Phone */}
					<View className="flex flex-row items-center mt-2">
						<MaterialIcons name="phone" size={20} color="#4A5568" />
						<Text className="text-base ml-2">
							Phone: {appointment?.userData.phone}
						</Text>
					</View>
				</View>

				{/* Action Buttons */}
				{showActions && (
					<View className="bg-white rounded-lg p-6 mt-6 shadow-sm">
						<Text className="text-xl font-bold mb-4">Actions</Text>

						{/* Rate Doctor Button */}
						{appointment?.isCompleted && !appointment?.rating && (
							<TouchableOpacity
								onPress={() => openRatingModal(appointment?._id)}
								className="bg-blue-500 p-3 rounded-lg mb-4"
							>
								<Text className="text-white text-center">Rate Doctor</Text>
							</TouchableOpacity>
						)}

						{/* Map through options for Payment and Cancel */}
						{!appointment?.isCompleted &&
							!appointment?.cancelled &&
							!appointment?.cardPayment &&
							!appointment?.cashPayment && (
								<>
									{["card", "cash", "cancel"].map((option) => (
										<TouchableOpacity
											key={option}
											onPress={() =>
												handleOptionSelect(option, appointment?._id)
											}
											className={`p-3 rounded-lg mb-4 ${
												option === "card"
													? "bg-green-500"
													: option === "cash"
													? "bg-yellow-500"
													: "bg-red-500"
											}`}
										>
											<Text className="text-white text-center">
												{option === "cancel"
													? "Cancel Appointment"
													: `Pay with ${
															option.charAt(0).toUpperCase() + option.slice(1)
													  }`}
											</Text>
										</TouchableOpacity>
									))}
								</>
							)}
					</View>
				)}

				{/* Add bottom padding for scrolling */}
				<View className="h-6" />
			</ScrollView>

			{/* Star Rating Modal */}
			<RatingModal
				visible={ratingModalVisible}
				onClose={() => setRatingModalVisible(false)}
				onSubmit={(rating, comment) => {
					submitRating(rating, comment) // Pass both rating and comment
				}}
			/>
		</View>
	)
}
