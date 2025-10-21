import { View, Text, Image, ScrollView } from "react-native"
import React from "react"
import { useLocalSearchParams } from "expo-router"
import { useRatingList } from "@/hooks/useDoctors"
import LoadingScreen from "../common/LoadingScreen"
import ErrorFetching from "../common/ErrorFetching"
import { MaterialIcons } from "@expo/vector-icons"

type RatingProps = {
	_id: string
	patientId: {
		_id: string
		name: string
		image: string
	}
	rating: number
	comment: string
}

export default function RatingsCard() {
	const { doctor_Id, doctorData } = useLocalSearchParams()

	const doctor = JSON.parse(String(doctorData))

	const {
		data: viewRating,
		isLoading: viewRatingIsLoading,
		isError: viewRatingIsError,
	} = useRatingList(String(doctor_Id))

	if (viewRatingIsLoading) {
		return <LoadingScreen />
	}

	if (viewRatingIsError) {
		return <ErrorFetching />
	}

	return (
		<ScrollView className="flex-1 px-4 py-6 bg-gray-100">
			{/* Doctor's Information */}
			<View className="flex-row items-center mb-6 bg-white rounded-lg p-4 shadow-lg">
				<Image
					source={{ uri: doctor.image }} // Assuming doctor.image contains the URL of the doctor's image
					className="w-20 h-20 rounded-full mr-4"
					style={{ borderWidth: 2, borderColor: "#007bff" }}
				/>
				<View className="flex-1">
					<Text className="text-2xl font-bold text-gray-800">
						{doctor.name}
					</Text>
					<Text className="text-sm text-gray-600">{doctor.email}</Text>
					<Text className="mt-2 text-xs italic text-gray-500">
						{doctor.speciality}
					</Text>
				</View>
			</View>

			{/* Ratings List */}
			{viewRating?.ratings.map((rating: RatingProps) => (
				<View
					key={rating._id}
					className="bg-white rounded-lg p-5 mb-4 shadow-lg border border-gray-200"
				>
					{/* Patient's Information */}
					<View className="flex-row items-center mb-3">
						<Image
							source={{ uri: rating.patientId.image }} // Assuming rating.patientId.image contains the URL of the patient's image
							className="w-12 h-12 rounded-full mr-3"
							style={{ borderWidth: 1.5, borderColor: "#FFD700" }}
						/>
						<View className="flex">
							<Text className="text-base font-semibold text-gray-800">
								{rating.patientId.name}
							</Text>
							<View className="flex-row items-center mt-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<MaterialIcons
										key={star}
										name={rating.rating >= star ? "star" : "star-border"}
										size={20}
										color={rating.rating >= star ? "#FFD700" : "#CCCCCC"}
									/>
								))}
								<Text className="text-sm text-gray-600 ml-2">
									({rating.rating})
								</Text>
							</View>
						</View>
					</View>

					{/* Comment */}
					<Text className="text-sm text-gray-700 mt-2 leading-relaxed">
						"{rating.comment}"
					</Text>
				</View>
			))}
		</ScrollView>
	)
}
