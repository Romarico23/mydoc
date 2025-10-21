import React from "react"
import { View } from "react-native"
import DoctorDetailsCard from "@/components/doctors/DoctorDetailsCard"

export default function DoctorDetailsScreen() {
	return (
		<View className="flex-1">
			<DoctorDetailsCard />
		</View>
	)
}
