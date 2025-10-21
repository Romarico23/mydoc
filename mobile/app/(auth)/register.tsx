import { View, Text } from "react-native"
import React from "react"
import { Link } from "expo-router"
import RegisterForm from "@/components/auth/RegisterForm"

export default function RegisterScreen() {
	return (
		<View className="flex-1 justify-center items-center bg-white p-4">
			<Text className="text-3xl font-bold text-blue-800 mb-6">Register</Text>
			<RegisterForm />
			<View className="flex flex-row gap-1">
				<Text>Already have an account?</Text>
				<Link href="/login">
					<Text className="text-blue-800">Login</Text>
				</Link>
			</View>
		</View>
	)
}
