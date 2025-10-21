import DoctorSpecialityCard from "@/components/doctors/DoctorSpecialityCard"
import React from "react"
import { View, Text } from "react-native"

export default function DoctorsScreen() {
	return (
		<View className="flex flex-col items-center justify-center h-full bg-white p-4">
			<Text className="text-2xl font-bold mb-4">Choose Your Doctor</Text>
			<DoctorSpecialityCard />
		</View>
	)
}
