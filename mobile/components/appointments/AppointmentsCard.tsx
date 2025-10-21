import { ScrollView, Alert, Text } from "react-native"
import React from "react"
import LoadingScreen from "../common/LoadingScreen"
import ErrorFetching from "../common/ErrorFetching"
import { AppointmentsCardProps } from "@/lib/types/types"
import { useAppointmentsList } from "@/hooks/useAppointments"
import { useRateDoctor } from "@/hooks/useAppointmentMutations"
import { useModalState } from "@/hooks/useModalState"
import { RatingModal } from "./RatingModal"
import { AppointmentCardItem } from "./AppointmentCardItem"
import { router } from "expo-router"
import { RefreshableScrollView } from "../common/RefreshableScrollView"
import { useRefreshData } from "@/hooks/useRefreshData"
import { View } from "react-native"

export default function AppointmentsCard() {
	const {
		modalVisibleMap,
		ratingModalVisible,
		selectedAppointmentId,
		toggleModal,
		openRatingModal,
		setRatingModalVisible,
	} = useModalState()

	// Fetch appointments
	const {
		data: viewAppointments,
		isLoading,
		isError,
		refetch,
	} = useAppointmentsList()

	// Mutation for rating a doctor
	const rateDoctorMutation = useRateDoctor()

	// Submit rating with optional comment
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

	const { onRefresh } = useRefreshData([refetch])

	// Render loading or error screens
	if (isLoading) return <LoadingScreen />
	if (isError) return <ErrorFetching />

	// Check if there are no appointments
	if (viewAppointments.appointments.length === 0) {
		return (
			<RefreshableScrollView onRefresh={onRefresh}>
				<View className="flex-1 justify-center items-center">
					<Text className="text-lg text-gray-600">
						No appointments available yet.
					</Text>
				</View>
			</RefreshableScrollView>
		)
	}

	return (
		<RefreshableScrollView
			onRefresh={onRefresh}
			showsVerticalScrollIndicator={false}
		>
			{viewAppointments.appointments.map(
				(appointment: AppointmentsCardProps) => {
					return (
						<AppointmentCardItem
							key={appointment._id}
							appointment={appointment}
							modalVisible={modalVisibleMap[appointment._id] || false}
							onToggleModal={() => toggleModal(appointment._id)}
							onRateDoctor={() => openRatingModal(appointment._id)}
							onPressNavigate={() =>
								router.push({
									pathname: "/(tabs)/appointments/[appointmentId]",
									params: {
										appointmentId: appointment._id,
										appointmentData: JSON.stringify(appointment),
									},
								})
							}
						/>
					)
				}
			)}

			{/* Star Rating Modal */}
			<RatingModal
				visible={ratingModalVisible}
				onClose={() => setRatingModalVisible(false)}
				onSubmit={(rating, comment) => {
					submitRating(rating, comment) // Pass both rating and comment
				}}
			/>
		</RefreshableScrollView>
	)
}
