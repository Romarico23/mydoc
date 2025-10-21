export const checkingDoctorAuth = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(
		"/api/doctor/checking-authenticated"
	)
	return response.data
}

export const viewAppointmentList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/doctor/appointment-list")
	return response.data
}

export const viewAppointmentDetail = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get(
		`/api/doctor/appointment-detail/${appointmentId}`
	)
	return response.data
}

export const appointmentCancel = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/doctor/appointment-cancel",
		{ appointmentId }
	)
	return response.data
}

export const appointmentComplete = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/doctor/appointment-complete",
		{ appointmentId }
	)
	return response.data
}

export const viewPatientList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/doctor/patient-list")
	return response.data
}

export const viewUserDetail = async (
	userId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get(
		`/api/doctor/user-detail/${userId}`
	)
	return response.data
}

export const viewDoctorProfile = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/doctor/doctor-profile")
	return response.data
}

export const viewSpecialityList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/doctor/speciality-list")
	return response.data
}

export const updateDoctorProfile = async (
	formData: FormData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/doctor/update-profile",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	)
	return response.data
}

export const changeAvailability = async (
	docId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/doctor/change-availability",
		{ docId }
	)
	return response.data
}

export const viewDoctorDashboard = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/doctor/dashboard")
	return response.data
}

export const viewDoctorNotificationList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/doctor/notification-list")
	return response.data
}

export const markNotificationAsRead = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		`/api/doctor/notification-read/${appointmentId}`
	)
	return response.data
}

export const searchUsers = async (query: string, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(
		`/api/doctor/search-users?query=${encodeURIComponent(query)}`
	)
	return response.data
}
