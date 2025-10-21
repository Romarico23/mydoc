import {
	View,
	Text,
	Image,
	Button,
	ScrollView,
	ActivityIndicator,
} from "react-native"
import React, { useState } from "react"
import { Link, useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { viewUserProfile } from "@/lib/services/api"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useQuery } from "@tanstack/react-query"
import { FontAwesome6 } from "@expo/vector-icons"
import LoadingScreen from "@/components/common/LoadingScreen"
import ErrorFetching from "@/components/common/ErrorFetching"
import { useProfile } from "@/hooks/useProfile"

export default function ProfileCard() {
	const router = useRouter()
	const axiosAuth = useAxiosAuth()

	const { data: viewUser, isLoading, isError } = useProfile()

	// Logout handler
	const handleLogout = async () => {
		await SecureStore.deleteItemAsync("jwtToken")
		router.replace("/") // Redirect to the home page
	}

	const navigateToEditProfile = () => {
		router.push("/(tabs)/profile/update_profile")
	}

	if (isLoading) {
		return <LoadingScreen />
	}

	if (isError) {
		return <ErrorFetching />
	}

	return (
		<View>
			<View className="flex items-center mb-6 pt-3">
				{/* Profile Image */}
				<View>
					{viewUser.image &&
					typeof viewUser.image === "string" &&
					viewUser.image.trim() !== "" ? (
						<Image
							className="relative w-20 h-20 z-10 rounded-full"
							source={{
								uri: viewUser.image,
							}}
							style={{ width: 80, height: 80, borderRadius: 40 }}
						/>
					) : (
						<Text className="relative">
							<FontAwesome6 name="user-circle" size={70} color="#ADD8E6" />
						</Text>
					)}
				</View>

				{/* Name */}
				<Text className="text-2xl font-bold text-gray-900 mt-2">
					{viewUser.name}
				</Text>
			</View>

			{/* Contact Information */}
			<View className="mb-6 space-y-3">
				<Text className="text-lg underline font-semibold text-gray-800">
					CONTACT INFORMATION
				</Text>
				{/* Email */}
				<View className="flex flex-row items-center justify-between">
					<Text className="font-semibold text-blue-800">Email:</Text>
					<Text className="text-gray-800">{viewUser.email}</Text>
				</View>

				{/* Phone */}
				<View className="flex flex-row items-center justify-between">
					<Text className="font-semibold text-blue-800">Phone:</Text>
					<Text className="text-gray-800">{viewUser.phone}</Text>
				</View>

				{/* Address */}
				<View className="flex flex-row items-start justify-between">
					<Text className="font-semibold text-blue-800">Address:</Text>
					<View className="space-y-3">
						{viewUser.address.line1 || viewUser.address.line2 ? (
							<>
								{viewUser.address.line1 && (
									<Text className="text-gray-800">
										{viewUser.address.line1}
									</Text>
								)}
								{viewUser.address.line2 && (
									<Text className="text-gray-800">
										{viewUser.address.line2}
									</Text>
								)}
							</>
						) : (
							<Text className="text-gray-800">Not provided</Text>
						)}
					</View>
				</View>
			</View>

			{/* Basic Information */}
			<View className="mb-4 space-y-3">
				<Text className="text-lg underline font-semibold text-gray-800">
					BASIC INFORMATION
				</Text>

				{/* Gender */}
				<View className="flex flex-row items-center justify-between">
					<Text className="font-semibold text-blue-800">Gender:</Text>
					<Text className="text-gray-800">
						{viewUser.gender === "Select Gender"
							? "Not provided"
							: viewUser.gender}
					</Text>
				</View>

				{/* Birth Date */}
				<View className="flex flex-row items-center justify-between">
					<Text className="font-semibold text-blue-800">Birth Date:</Text>
					<Text className="text-gray-800">
						{viewUser.birthDate === "Select Birth Date" || !viewUser.birthDate
							? "Not provided"
							: new Date(viewUser.birthDate).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
							  })}
					</Text>
				</View>
			</View>

			{/* Navigate Button */}
			<Button title="Edit Profile" onPress={navigateToEditProfile} />

			{/* Logout Button */}
			<View className="mt-4 pb-6">
				<Button title="Logout" onPress={handleLogout} />
			</View>
		</View>
	)
}
