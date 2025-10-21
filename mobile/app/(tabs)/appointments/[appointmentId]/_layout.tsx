import { Stack } from "expo-router"
import React from "react"

export default function AppointmentDetailsLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "",
					headerTransparent: true,
					headerTintColor: "white",
				}}
			/>
		</Stack>
	)
}
