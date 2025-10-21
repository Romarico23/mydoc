import DoctorList from "@/components/admin/doctors/DoctorList"
import React from "react"

function Doctors() {
	return (
		<div>
			<h1 className="text-2xl font-semibold py-2">All Doctors</h1>
			<DoctorList />
		</div>
	)
}

export default Doctors
