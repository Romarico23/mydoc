import { AppointmentData, AppointmentPaymentData } from "../types/types"
// import { AppointmentData } from "../types/types"

export const viewUserProfile = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/user/get-profile")
	return response.data.userData
}

export const updateUserProfile = async (
	formData: FormData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/user/update-profile",
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
	const response = await axiosAuthInstance.get("/api/user/speciality-list")
	return response.data
}

export const viewDoctorList = async (
	speciality_name: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get("/api/user/doctor-list", {
		params: { speciality: speciality_name },
	})
	return response.data
}

export const viewTopDoctorsList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/user/top-doctors-list")
	return response.data
}

export const viewFavoriteDoctorsList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(
		"/api/user/favorite-doctors-list"
	)
	return response.data
}

export const addFavorite = async (docId: string, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.post("/api/user/add-favorite", {
		docId,
	})
	return response.data
}

export const deleteFavorite = async (docId: string, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.post("/api/user/delete-favorite", {
		docId,
	})
	return response.data
}

export const bookAppointment = async (
	appointmentData: AppointmentData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/user/book-appointment",
		appointmentData
	)
	return response.data
}

export const viewAppointmentList = async (axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get("/api/user/appointment-list")
	return response.data
}

export const viewAppointmentDetails = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.get(
		`/api/user/appointment-details/${appointmentId}`
	)
	return response.data
}

export const cancelAppointment = async (
	// appointmentId: AppointmentId,
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/user/cancel-appointment",
		{ appointmentId }
	)
	return response.data
}

export const handlePayment = async (
	appointmentPaymentData: AppointmentPaymentData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/user/handle-payment",
		appointmentPaymentData
	)
	return response.data
}

export const verifyStripepay = async (
	appointmentId: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post("/api/user/verify-stripepay", {
		appointmentId,
	})
	return response.data
}
export const rateDoctor = async (
	appointmentId: string,
	rating: number,
	comment: string,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post("/api/user/rate-doctor", {
		appointmentId,
		rating,
		comment,
	})
	return response.data
}

export const viewRatingList = async (docId: string, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(`/api/user/rating-list/${docId}`)
	return response.data
}

export const searchDoctors = async (query: string, axiosAuthInstance: any) => {
	const response = await axiosAuthInstance.get(
		`/api/user/search-doctors?query=${encodeURIComponent(query)}`
	)
	return response.data
}
