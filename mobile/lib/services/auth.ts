export const loginUser = async (
	loginData: FormData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post("/api/user/login", loginData)
	return response.data
}

export const registerUser = async (
	registerData: FormData,
	axiosAuthInstance: any
) => {
	const response = await axiosAuthInstance.post(
		"/api/user/register",
		registerData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	)
	return response.data
}

// export const loginUser = async (
// 	loginData: LoginFormInputs
// ): Promise<LoginResponse> => {
// 	const response = await axios.post<LoginResponse>(
// 		"/api/user/login", // Make sure the API URL matches your backend
// 		loginData
// 	)
// 	return response.data
// }

// export const viewDoctorList = async (axiosAuthInstance: any) => {
// 	const response = await axiosAuthInstance.get("/api/admin/doctor-list")
// 	return response.data
// }

// export const changeAvailability = async (
// 	docId: string,
// 	axiosAuthInstance: any
// ) => {
// 	const response = await axiosAuthInstance.post(
// 		"/api/admin/change-availability",
// 		{ docId }
// 	)
// 	return response.data
// }
// API call to login
// const login = async (loginData: LoginFormInputs): Promise<LoginResponse> => {
// 	const response = await axios.post<LoginResponse>(
// 		"http://your-backend-api.com/login",
// 		loginData
// 	)
// 	return response.data
// }
