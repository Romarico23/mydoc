import AppointmentList from "@/components/doctor/appointments/AppointmentList"
import React from "react"

function Appointments() {
	return (
		<div>
			<h1 className="text-2xl font-semibold py-2">All Appointments</h1>
			<AppointmentList />
		</div>
	)
}

export default Appointments
