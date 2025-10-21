import React from "react"
import { Stack } from "expo-router"

export default function SpecialityLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="[doctor_Id]" options={{ headerShown: false }} />
		</Stack>
	)
}
