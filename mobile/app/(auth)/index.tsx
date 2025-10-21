import React from "react"
import { View, Text, Image } from "react-native"
import { Link } from "expo-router"

export default function WelcomeScreen() {
	return (
		<View className="flex-1 justify-center items-center bg-white p-4">
			{/* Header Text */}
			<Text className="text-4xl font-extrabold text-blue-800 mb-3 text-center">
				Welcome to MyDoc
			</Text>

			{/* Subheader */}
			<Text className="text-base text-gray-600 mb-6 text-center w-4/5">
				Your trusted healthcare companion — book doctor appointments, manage
				your health, and get care anytime, anywhere.
			</Text>

			{/* Doctor Image */}
			<Image
				source={require("../../assets/images/mydoc_logo.png")}
				className="w-36 h-36 mb-4"
			/>

			{/* Login Button */}
			<Link
				href="/login"
				className="bg-blue-800 py-3 px-8 rounded-full w-4/5 mb-4 items-center justify-center"
			>
				<Text className="text-white text-center text-lg">LOGIN</Text>
			</Link>

			{/* Create Account Button */}
			<Link
				href="/register"
				className="border-2 border-blue-800 py-3 px-8 rounded-full w-4/5 items-center justify-center"
			>
				<Text className="text-blue-800 text-center text-lg">
					CREATE ACCOUNT
				</Text>
			</Link>
		</View>
	)
}
