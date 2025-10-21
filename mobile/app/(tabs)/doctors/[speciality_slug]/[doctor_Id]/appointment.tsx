import AppointmentCard from "@/components/doctors/AppointmentCard"
import React, { useState } from "react"
import { View } from "react-native"

export default function AppointmentScreen() {
	return (
		<View className="flex-1">
			<AppointmentCard />
		</View>
	)
}
