import { View, Text, TouchableOpacity, Image } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"

interface Doctor {
	_id: string
	name: string
	image: string
	speciality: string
	ratings: { average: number }
}

interface DoctorsListCardProps {
	doctors: Doctor[]
}

export default function DoctorsListCard({ doctors }: DoctorsListCardProps) {
	if (!doctors || doctors.length === 0) {
		return (
			<View className="px-6 mt-4">
				<Text className="text-gray-500 text-center">No doctors available.</Text>
			</View>
		)
	}

	return (
		<View className="px-6 mt-4">
			{doctors.map((doctor) => (
				<TouchableOpacity
					key={doctor._id}
					className="bg-white rounded-xl p-4 mb-16 shadow-lg"
					onPress={() => {
						router.push({
							pathname: "/(tabs)/doctors/[speciality_slug]/[doctor_Id]",
							params: {
								speciality_slug: doctor?.speciality,
								doctor_Id: doctor._id,
								doctorData: JSON.stringify(doctor),
							},
						})
					}}
				>
					<View className="flex-row items-center">
						<View className="w-20 h-20">
							<Image
								source={{ uri: doctor.image }}
								className="w-full h-full object-cover"
							/>
						</View>
						<View className="ml-4 flex-1">
							<Text className="text-xl font-bold text-gray-800">
								{doctor.name}
							</Text>
							<Text className="text-gray-500 text-sm mt-1">
								{doctor.speciality}
							</Text>
							{/* Rating */}
							{doctor.ratings?.average ? (
								<TouchableOpacity
									onPress={() => {
										router.push({
											pathname:
												"/(tabs)/doctors/[speciality_slug]/[doctor_Id]/ratings",
											params: {
												speciality_slug: doctor?.speciality,
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
										<Text className="text-gray-500 text-sm ml-2">
											({doctor.ratings.average.toFixed(1)})
										</Text>
									</View>
								</TouchableOpacity>
							) : (
								<Text>No ratings yet</Text>
							)}
						</View>
					</View>
				</TouchableOpacity>
			))}
		</View>
	)
}
