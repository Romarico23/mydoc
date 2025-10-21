import React from "react"
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { useSpecialityList } from "@/hooks/useDoctors"
import LoadingScreen from "@/components/common/LoadingScreen"
import ErrorFetching from "@/components/common/ErrorFetching"
import { router } from "expo-router"
import { RefreshableScrollView } from "../common/RefreshableScrollView"
import { useRefreshData } from "@/hooks/useRefreshData"

export default function DoctorSpecialityCard() {
	const {
		data: viewSpecialities,
		isLoading: viewSpecialitiesIsLoading,
		isError: viewSpecialitiesIsError,
		refetch: refetchSpecialities,
	} = useSpecialityList()

	const { onRefresh } = useRefreshData([refetchSpecialities])

	if (viewSpecialitiesIsLoading) {
		return <LoadingScreen />
	}

	if (viewSpecialitiesIsError) {
		return <ErrorFetching />
	}

	return (
		<RefreshableScrollView
			onRefresh={onRefresh}
			contentContainerStyle={styles.container} // Apply centering styles here
		>
			<View className="flex flex-row flex-wrap justify-between">
				{viewSpecialities.specialities.map(
					(speciality: {
						_id: string
						name: string
						image: string
						slug: any
						doctorCount: number
					}) => (
						<TouchableOpacity
							key={speciality._id}
							className="bg-blue-300 rounded-lg p-6 m-2 w-[45%]"
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
									className="w-16 h-16 rounded-full mb-2"
									resizeMode="cover"
								/>
								<Text className="text-white font-bold text-center">
									{speciality.name}
								</Text>
							</View>
						</TouchableOpacity>
					)
				)}
			</View>
		</RefreshableScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1, // Ensures the container takes up the full height
		justifyContent: "center", // Centers content vertically
		alignItems: "center", // Centers content horizontally
	},
})
