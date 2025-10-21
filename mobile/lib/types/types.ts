export type LoginFormData = {
	email: string
	password: string
}

export type LoginResponse = {
	token: string
	message: string
}

// Define an interface for the form data
export type RegisterFormData = {
	name: string
	email: string
	password: string
	image: string
}

export type RegisterResponse = {
	token: string
	message: string
}

export interface Address {
	line1: string
	line2: string
}

export type UpdateUserFormData = {
	// userId: string
	name: string
	email: string
	phone: string
	address: Address
	birthDate: string
	gender: string
	image: string
}

export type UpdateUserResponse = {
	// token: string
	message: string
}

export type DoctorCardProps = {
	_id: string
	name: string
	degree: string
	image: string
	available?: boolean
	experience: string
	fees: number
	ratings: {
		average: number
		count: number
	}
	address: Address
	// address: any
	about: string
	speciality: string
}

export type AppointmentData = {
	docId: string
	slotDate: string
	slotTime: string
}

// export type AppointmentId = {
// 	appId: any
// }

export type AppointmentsCardProps = {
	_id: string
	userId: string
	docId: string
	slotDate: string
	slotTime: string
	amount: number
	userData: any
	docData: any
	cancelled: boolean
	cardPayment: boolean
	cashPayment: boolean
	isCompleted: boolean
	rating: number
}

export type AppointmentPaymentData = {
	appointmentId: string
	paymentMethod: string
}
