import React from "react"
import { router, Stack } from "expo-router"
import { TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function DoctorDetailsLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: true,
					title: "",
					headerTransparent: true,
					headerTintColor: "white",
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()}>
							<Ionicons name="arrow-back" size={24} color="white" />
						</TouchableOpacity>
					),
				}}
			/>
			<Stack.Screen
				name="appointment"
				options={{
					headerShown: true,
					title: "Book an Appointment",
					headerTransparent: false,
					headerTintColor: "black",
				}}
			/>
			<Stack.Screen
				name="ratings"
				options={{
					headerShown: true,
					title: "  Ratings/Comments",
					// headerTransparent: true,
					headerTintColor: "black",
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()}>
							<Ionicons name="arrow-back" size={24} color="black" />
						</TouchableOpacity>
					),
				}}
			/>
		</Stack>
	)
}
