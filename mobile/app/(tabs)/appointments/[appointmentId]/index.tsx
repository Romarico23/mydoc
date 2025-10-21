import { StyleSheet, View, Text, Button, Platform, Alert } from "react-native"
import React, { useEffect, useState } from "react"
import { ScrollView } from "react-native-gesture-handler"
import AppointmentsCard from "@/components/appointments/AppointmentsCard"
import AppointmentDetailsCard from "@/components/appointments/AppointmentDetailsCard"

export default function AppointmentDetailsScreen() {
	return (
		<View className="flex-1 bg-white p-">
			{/* <Text className="text-center text-2xl font-bold mb-4">
				Appointment Details
			</Text> */}
			<AppointmentDetailsCard />
		</View>
	)
}
