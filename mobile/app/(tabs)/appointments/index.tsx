import { StyleSheet, View, Text, Button, Platform, Alert } from "react-native"
import React, { useEffect, useState } from "react"
import { ScrollView } from "react-native-gesture-handler"
import AppointmentsCard from "@/components/appointments/AppointmentsCard"

export default function AppointmentsScreen() {
	return (
		<View className="flex-1 bg-white p-3">
			<Text className="text-center text-2xl font-bold mb-4">
				My Appointments
			</Text>
			<AppointmentsCard />
		</View>
	)
}
