import { View, Text } from "react-native"
import React from "react"
import LoginForm from "@/components/auth/LoginForm"
import { Link } from "expo-router"

export default function LoginScreen() {
	return (
		<View className="flex-1 justify-center items-center bg-white p-4">
			<Text className="text-3xl font-bold text-blue-800 mb-6">Login</Text>
			<LoginForm />
			<View className="flex flex-row gap-1">
				<Text>Don't have an account?</Text>
				<Link href="/register">
					<Text className="text-blue-800">Register</Text>
				</Link>
			</View>
		</View>
	)
}
