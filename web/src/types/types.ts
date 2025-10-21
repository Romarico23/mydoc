import { Key, ReactNode } from "react"

export type LoginFormData = {
	email: string
	password: string
}

export type Address = {
	line1: string
	line2: string
}

export type DoctorFormData = {
	_id: string
	name: string
	available: boolean
	email: string
	password: string
	experience: string
	fees: string
	speciality: string
	degree: string
	address: Address
	about: string
	image: FileList | null // Allow both file uploads and existing URLs
}

// export type ApiRequest {
// 	method: string
// 	body: DoctorFormData
// }

// export type ApiResponse {
// 	status: (code: number) => ApiResponseInstance
// }

// export type ApiResponseInstance {
// 	json: (data: { message: string; error?: any }) => void
// }

export type DoctorListProps = {
	// _id: string
	// name: string
	// speciality: string
	// image: string
	// available?: boolean
	_id: string
	name: string
	available: boolean
	email: string
	password: string
	experience: string
	fees: string
	speciality: string
	degree: string
	address: Address
	about: string
	image: string
	slots_booked: string
}

export type DoctorDetailData = {
	doctor: DoctorListProps
}

// export type DoctorSearchData = {
// 	doctors: DoctorListProps
// }

export type SpecialityFormData = {
	name: string
	slug: string
	description: string
	status: boolean
	// status: boolean
	image: FileList | null // Correctly typed for file inputs
}

export type AppointmentListProps = {
	_id: string
	// userData: {
	// 	name: string
	// 	age: number
	// 	image?: string // Optional image for the patient
	// 	birthDate: string
	// }
	userData: UserFormData
	docData: {
		name: string
		speciality: string
		image?: string // Optional image for the doctor
	}
	slotDate: string
	slotTime: string
	amount: number
	cardPayment: boolean
	cashPayment: boolean
	cancelled: boolean
	isCompleted: boolean
}

export type AppointmentDetailProps = {
	appointment: AppointmentListProps
}

export type DashboardData = {
	dashboardData: {
		doctors: number
		appointments: string
		patients: number
	}
}

export type LatestAppointmentData = {
	dashboardData: {
		latesAppointments: AppointmentListProps
	}
}

export type UserFormData = {
	_id: string
	name: string
	email: string
	phone: string
	address: Address
	birthDate: string
	gender: string
	image: string
}

export type PatientData = {
	user: UserFormData
}

export type DoctorProfileData = {
	doctor: DoctorListProps
	// doctor: {
	// 	_id: string
	// 	name: string
	// 	available: boolean
	// 	email: string
	// 	password: string
	// 	experience: string
	// 	fees: string
	// 	speciality: string
	// 	degree: string
	// 	address: Address
	// 	about: string
	// 	image: string
	// }
}

// export type UpdateDoctorFormData = {
// 	name: string
// 	email: string
// 	experience: string
// 	fees: string
// 	speciality: string
// 	degree: string
// 	address: Address
// 	about: string
// 	image: FileList | null
// 	// image: string
// }

export type NotificationData = {
	_id: string
	docId: string
	message: string
	read: boolean
	type: string
	appointmentId: string
	metadata?: {
		slotDate: string
		slotTime: string
	}
	createdAt?: Date
	updatedAt?: Date
}

// export type NotificationButton = {
// 	notifications: NotificationData[]
// }
