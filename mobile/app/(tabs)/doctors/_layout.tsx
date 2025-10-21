import { Stack } from "expo-router"
import React from "react"

export default function DoctorsLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="[speciality_slug]" options={{ headerShown: false }} />
		</Stack>
	)
}
