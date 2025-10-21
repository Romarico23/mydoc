import DoctorsListCard from "@/components/doctors/DoctorsListCard"
import React from "react"
import { View } from "react-native"

export default function SpecialityListScreen() {
	return (
		<View className="flex-1 bg-white p-4">
			<DoctorsListCard />
		</View>
	)
}
