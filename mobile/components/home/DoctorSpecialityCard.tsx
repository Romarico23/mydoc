import React from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { router } from "expo-router"

type Speciality = {
	_id: string
	name: string
	image: string
	slug: any
	doctorCount: number
}

type SpecialityCardProps = {
	specialities: Speciality[]
}

export default function DoctorSpecialityCard({
	specialities,
}: SpecialityCardProps) {
	return (
		<View className="p-6">
			<View className="flex-row justify-between items-center mb-6">
				<Text className="text-xl text-gray-800 font-bold">
					Find by Speciality
				</Text>
				<TouchableOpacity
					onPress={() =>
						router.push({
							pathname: "/(tabs)/doctors",
						})
					}
				>
					<Text className="text-sm text-blue-600 font-semibold">See all</Text>
				</TouchableOpacity>
			</View>

			{/* Check if there are no specialties */}
			{specialities.length === 0 ? (
				<View className="flex-1 justify-center items-center">
					<Text className="text-lg text-gray-600">
						No specialties available yet.
					</Text>
				</View>
			) : (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="flex-row"
				>
					<View className="flex-row items-center">
						{specialities.map((speciality) => (
							<TouchableOpacity
								key={speciality._id}
								className="bg-white mr-4 rounded-lg w-36 h-36 flex items-center justify-center"
								onPress={() =>
									router.push({
										pathname: "/(tabs)/doctors/[speciality_slug]",
										params: {
											speciality_slug: speciality.slug,
											speciality_name: speciality.name,
										},
									})
								}
							>
								<View className="flex flex-col items-center">
									<Image
										source={{ uri: speciality.image }}
										className="w-16 h-16 rounded-full"
										resizeMode="cover"
									/>
									<Text className="text-blue-500">{speciality.name}</Text>
									<Text className="text-gray-500 text-xs">
										{speciality.doctorCount} doctors
									</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			)}
		</View>
	)
}
