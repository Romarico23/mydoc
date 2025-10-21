// hooks/useModalState.js
import { useState } from "react"

export const useModalState = () => {
	const [modalVisibleMap, setModalVisibleMap] = useState<
		Record<string, boolean>
	>({})
	const [ratingModalVisible, setRatingModalVisible] = useState(false)
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<
		string | null
	>(null)

	const toggleModal = (appointmentId: string) => {
		setModalVisibleMap((prev) => ({
			...prev,
			[appointmentId]: !prev[appointmentId],
		}))
	}

	const openRatingModal = (appointmentId: string) => {
		setSelectedAppointmentId(appointmentId)
		setRatingModalVisible(true)
	}

	return {
		modalVisibleMap,
		ratingModalVisible,
		selectedAppointmentId,
		setModalVisibleMap,
		toggleModal,
		openRatingModal,
		setRatingModalVisible,
	}
}
