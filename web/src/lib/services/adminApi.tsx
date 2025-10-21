export const checkingAdminAuth = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(
		"/api/admin/checking-authenticated"
	)
	return response.data
}

export const addDoctor = async (formData: FormData, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.post(
		"/api/admin/add-doctor",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	)
	return response.data
}

export const addSpeciality = async (
	formData: FormData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/admin/add-speciality",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	)
	return response.data
}

export const viewSpecialityList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/admin/speciality-list")
	return response.data
}

export const viewDoctorList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/admin/doctor-list")
	return response.data
}

export const viewDoctorDetail = async (
	doctorId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get(
		`/api/admin/doctor-detail/${doctorId}`
	)
	return response.data
}

export const changeAvailability = async (
	docId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/admin/change-availability",
		{ docId }
	)
	return response.data
}

export const viewPatientList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/admin/patient-list")
	return response.data
}

export const viewUserDetail = async (
	userId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get(
		`/api/admin/user-detail/${userId}`
	)
	return response.data
}

export const viewAppointmentList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/admin/appointment-list")
	return response.data
}

export const viewAppointmentDetail = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get(
		`/api/admin/appointment-detail/${appointmentId}`
	)
	return response.data
}

export const appointmentCancel = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/admin/appointment-cancel",
		{ appointmentId }
	)
	return response.data
}

export const appointmentComplete = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/admin/appointment-complete",
		{ appointmentId }
	)
	return response.data
}

export const viewAdminDashboard = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/admin/dashboard")
	return response.data
}

export const viewAdminNotificationList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/admin/notification-list")
	return response.data
}

export const markNotificationAsRead = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		`/api/admin/notification-read/${appointmentId}`
	)
	return response.data
}

export const searchProfiles = async (query: string, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(
		`/api/admin/search-profiles?query=${encodeURIComponent(query)}`
	)
	return response.data
}
