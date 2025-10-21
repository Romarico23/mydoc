import {
	View,
	TextInput,
	ScrollView,
	Text,
	TouchableOpacity,
	Image,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { DoctorCardProps } from "@/lib/types/types"
import React from "react"
import { router } from "expo-router"

interface SearchBarCardProps {
	query: string
	setQuery: (text: string) => void
	viewSearch: { doctors: DoctorCardProps[] } | undefined
	searchIsLoading: boolean
	searchIsError: boolean
}

export default function SearchBarCard({
	query,
	setQuery,
	viewSearch,
	searchIsLoading,
	searchIsError,
}: SearchBarCardProps) {
	return (
		<View className="relative">
			<View className="flex-row items-center bg-white rounded-full px-4 py-2 mt-4 shadow-sm">
				<TextInput
					placeholder="Search doctors..."
					className="flex-1 text-base"
					value={query}
					onChangeText={setQuery}
				/>
			</View>

			{!!query && (
				<ScrollView className="absolute top-20 left-0 w-full bg-white rounded-lg shadow-2xl p-3 z-10">
					{searchIsLoading && <Text className="text-gray-500">Loading...</Text>}
					{searchIsError && (
						<Text className="text-red-500">
							Error fetching data. Try again.
						</Text>
					)}
					{!searchIsLoading && !searchIsError && (
						<>
							{viewSearch?.doctors.length === 0 ? (
								<Text className="text-gray-600">No results found.</Text>
							) : (
								<ScrollView className="max-h-48">
									{viewSearch?.doctors.map((doctor) => (
										<TouchableOpacity
											key={doctor._id}
											className="flex-row items-center gap-3 p-2 border-b border-gray-100"
											onPress={() => {
												router.push({
													pathname:
														"/(tabs)/doctors/[speciality_slug]/[doctor_Id]",
													params: {
														speciality_slug: doctor.speciality,
														doctor_Id: doctor._id,
														doctorData: JSON.stringify(doctor),
													},
												})
											}}
										>
											<View className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
												{doctor.image ? (
													<Image
														source={{ uri: doctor.image }}
														className="w-full h-full object-cover"
													/>
												) : (
													<MaterialIcons
														name="person-search"
														size={24}
														color="#3B82F6"
													/>
												)}
											</View>
											<View className="flex-1">
												<Text className="text-base font-medium text-gray-800">
													{doctor.name}
												</Text>
												<Text className="text-sm text-gray-500">
													{doctor.speciality}
												</Text>
											</View>
										</TouchableOpacity>
									))}
								</ScrollView>
							)}
						</>
					)}
				</ScrollView>
			)}
		</View>
	)
}
