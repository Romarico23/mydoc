import AppointmentDetailCard from "@/components/doctor/appointments/AppointmentDetailCard"
import React from "react"

function AppointmentDetail() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Appointment Details</h1>
			<AppointmentDetailCard />
		</div>
	)
}

export default AppointmentDetail
