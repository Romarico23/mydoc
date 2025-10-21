import { View, Text } from "react-native"
import React from "react"
import { Stack } from "expo-router"

export default function ProfileLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="update_profile" options={{ headerShown: false }} />
		</Stack>
	)
}
