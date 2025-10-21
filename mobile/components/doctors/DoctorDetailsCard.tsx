import React from "react"
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { router } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"
import { useQueryClient } from "@tanstack/react-query"
import { useAddFavorite, useDeleteFavorite } from "@/hooks/useDoctorMutation"
import { useProfile } from "@/hooks/useProfile"

export default function DoctorDetailsCard() {
	const { doctorData, speciality_slug } = useLocalSearchParams()
	const doctor = JSON.parse(String(doctorData))
	const queryClient = useQueryClient()

	const {
		data: viewUser,
		isLoading: viewUserIsLoading,
		isError: viewUserIsError,
	} = useProfile()

	// Favorite Mutations
	const addFavoriteMutation = useAddFavorite()
	const deleteFavoriteMutation = useDeleteFavorite()

	// Check if doctor is in favorites
	const isFavorite = !!viewUser?.favorites?.includes(doctor._id)

	// Handle Favorite Toggle
	const toggleFavorite = () => {
		if (isFavorite) {
			deleteFavoriteMutation.mutate(doctor._id)
		} else {
			addFavoriteMutation.mutate(doctor._id)
		}
	}

	console.log(viewUser)

	return (
		<View className="flex-1">
			{/* Top Section with Blue Background */}
			<View className="bg-blue-400 items-center p-4">
				{/* Doctor Image */}
				<View className="w-60 h-60">
					<Image
						source={{ uri: doctor.image }}
						className="w-full h-full object-cover"
					/>
				</View>
			</View>

			{/* Bottom Section with Gray Background */}
			<ScrollView
				className="flex-1 bg-gray-100 px-4 pt-6"
				showsVerticalScrollIndicator={false}
			>
				{/* Doctor Details */}
				<View className=" space-y-1">
					<View className="flex-row items-center">
						{/* Doctor Name */}
						<Text className="text-2xl font-bold">{doctor.name}</Text>

						{/* Favorite Button */}
						<TouchableOpacity
							className="absolute right-0 bg-blue-200 rounded-full p-2 shadow"
							onPress={toggleFavorite}
						>
							<MaterialIcons
								name={isFavorite ? "favorite" : "favorite-border"}
								size={28}
								color={isFavorite ? "red" : "gray"}
							/>
						</TouchableOpacity>
					</View>

					{/* Rating */}
					{doctor.ratings.average ? (
						<TouchableOpacity
							onPress={() => {
								router.push({
									pathname:
										"/(tabs)/doctors/[speciality_slug]/[doctor_Id]/ratings",
									params: {
										speciality_slug: speciality_slug.toString(),
										doctor_Id: doctor._id,
										doctorData: JSON.stringify(doctor),
									},
								})
							}}
						>
							<View className="flex-row items-center">
								{[1, 2, 3, 4, 5].map((star) => (
									<MaterialIcons
										key={star}
										name={
											doctor.ratings.average >= star ? "star" : "star-border"
										}
										size={20}
										color={
											doctor.ratings.average >= star ? "#FFD700" : "#CCCCCC"
										}
									/>
								))}
							</View>
						</TouchableOpacity>
					) : (
						<Text>No ratings yet</Text>
					)}

					{/* Degree, Specialty, and Experience */}
					<View className="flex flex-row items-center justify-between">
						<View className="flex flex-row">
							{/* Degree */}
							<Text className="text-base">{doctor.degree} - </Text>
							{/* Specialty */}
							<Text className="text-base">{doctor.speciality}</Text>
						</View>

						{/* Experience with Circle Border */}
						<View className="px-3 py-1 bg-blue-100 border border-blue-400 rounded-full">
							<Text className="text-base font-semibold text-blue-500">
								{doctor.experience}
							</Text>
						</View>
					</View>

					{/* Fees */}
					<Text className="text-base">Appointment Fee: ${doctor.fees}</Text>

					{/* Address */}
					<Text className="text-base">
						Address: {doctor.address.line1}, {doctor.address.line2}
					</Text>

					{/* About */}
					<Text className="text-base">About: {doctor.about}</Text>
				</View>

				{/* Book Appointment Button */}
				<TouchableOpacity
					key={doctor._id}
					className="items-center bg-blue-500 p-3 m-4 rounded-lg shadow"
					onPress={() =>
						router.push({
							pathname:
								"/(tabs)/doctors/[speciality_slug]/[doctor_Id]/appointment",
							params: {
								speciality_slug: speciality_slug.toString(),
								doctor_Id: doctor._id,
								doctorData: doctorData,
							},
						})
					}
				>
					<Text className="text-white text-base">Book an Appointment</Text>
				</TouchableOpacity>

				{/* Add bottom padding for scrolling */}
				<View className="h-6" />
			</ScrollView>
		</View>
	)
}
