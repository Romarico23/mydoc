import PatientList from "@/components/doctor/patients/PatientList"
import React from "react"

function Patients() {
	return (
		<div>
			<h1 className="text-2xl font-semibold py-2">All Your Patients</h1>
			<PatientList />
		</div>
	)
}

export default Patients
