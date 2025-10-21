import { Stack } from "expo-router"
import React from "react"

export default function AppointmentsLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			{/* <Stack.Screen name="[speciality_slug]" options={{ headerShown: false }} /> */}
			<Stack.Screen name="[appointmentId]" options={{ headerShown: false }} />
		</Stack>
	)
}
