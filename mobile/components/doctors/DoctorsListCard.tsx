import ErrorFetching from "@/components/common/ErrorFetching"
import LoadingScreen from "@/components/common/LoadingScreen"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useAddFavorite, useDeleteFavorite } from "@/hooks/useDoctorMutation"
import { useDoctorList } from "@/hooks/useDoctors"
import { useProfile } from "@/hooks/useProfile"
import { viewDoctorList } from "@/lib/services/api"
import { DoctorCardProps } from "@/lib/types/types"
import { FontAwesome, MaterialIcons } from "@expo/vector-icons"
import { useQuery } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { RefreshableScrollView } from "../common/RefreshableScrollView" // Import the reusable component
import { useRefreshData } from "@/hooks/useRefreshData"

export default function DoctorsListCard() {
	const { speciality_slug, speciality_name } = useLocalSearchParams()

	const {
		data: viewUser,
		isLoading: viewUserIsLoading,
		isError: viewUserIsError,
	} = useProfile()

	const addFavoriteMutation = useAddFavorite()
	const deleteFavoriteMutation = useDeleteFavorite()

	const {
		data: viewDoctors,
		isLoading: viewDoctorsIsLoading,
		isError: viewDoctorsIsError,
		refetch: refetchDoctors, // Add refetch function
	} = useDoctorList(String(speciality_slug))

	const { onRefresh } = useRefreshData([refetchDoctors])

	if (viewDoctorsIsLoading || viewUserIsLoading) {
		return <LoadingScreen />
	}

	if (viewDoctorsIsError || viewUserIsError) {
		return <ErrorFetching />
	}

	// Check if there are no doctors
	if (viewDoctors.doctors.length === 0) {
		return (
			<RefreshableScrollView onRefresh={onRefresh}>
				<View className="flex-1 justify-center items-center">
					<Text className="text-2xl font-bold text-center mb-6">
						{String(speciality_name)} Doctors
					</Text>
					<Text className="text-lg text-gray-600">
						No doctors available yet.
					</Text>
				</View>
			</RefreshableScrollView>
		)
	}

	return (
		<RefreshableScrollView onRefresh={onRefresh}>
			<View className="flex-1">
				<Text className="text-2xl font-bold text-center mb-6">
					{String(speciality_name)} Doctors
				</Text>
				{viewDoctors.doctors.map((doctor: DoctorCardProps) => (
					<TouchableOpacity
						key={doctor._id}
						className="flex-row items-center justify-between bg-gray-100 p-4 rounded-lg shadow mb-4"
						onPress={() =>
							router.push({
								pathname: "/(tabs)/doctors/[speciality_slug]/[doctor_Id]",
								params: {
									speciality_slug: speciality_slug.toString(),
									doctor_Id: doctor._id,
									doctorData: JSON.stringify(doctor),
								},
							})
						}
					>
						<View className="flex-row items-center">
							<Image
								source={{ uri: doctor.image }}
								className="w-16 h-16 rounded-full mr-4"
								alt={`${doctor.name}'s profile`}
							/>
							<View>
								<View className="flex flex-row gap-2 items-center">
									<View
										className={`w-3 h-3 rounded-full ${
											doctor.available === true ? "bg-green-500" : "bg-gray-300"
										}`}
									/>
									<Text
										className={`${
											doctor.available === true
												? "text-green-500"
												: "text-gray-500"
										}`}
									>
										{doctor.available === true ? "Available" : "Unavailable"}
									</Text>
								</View>
								<Text className="text-lg font-semibold">{doctor.name}</Text>
								<Text className="text-sm text-gray-600">
									{doctor.speciality}
								</Text>
								{doctor.ratings.average ? (
									<View className="flex-row items-center">
										{[1, 2, 3, 4, 5].map((star) => (
											<MaterialIcons
												key={star}
												name={
													doctor.ratings.average >= star
														? "star"
														: "star-border"
												}
												size={20}
												color={
													doctor.ratings.average >= star ? "#FFD700" : "#CCCCCC"
												}
											/>
										))}
									</View>
								) : (
									<Text>No ratings yet</Text>
								)}
							</View>
						</View>

						{/* Favorite Button */}
						<TouchableOpacity
							onPress={() => {
								if (viewUser?.favorites.includes(doctor._id)) {
									deleteFavoriteMutation.mutate(doctor._id)
								} else {
									addFavoriteMutation.mutate(doctor._id)
								}
							}}
							className="p-2"
						>
							<FontAwesome
								name={
									viewUser?.favorites.includes(doctor._id) ? "heart" : "heart-o"
								}
								size={24}
								color={
									viewUser?.favorites.includes(doctor._id) ? "red" : "gray"
								}
							/>
						</TouchableOpacity>
					</TouchableOpacity>
				))}
			</View>
		</RefreshableScrollView>
	)
}
