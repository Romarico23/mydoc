import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	RefreshControl,
} from "react-native"
import React, { useState } from "react"
import SpecialityCard from "@/components/home/DoctorSpecialityCard"
import LoadingScreen from "../common/LoadingScreen"
import ErrorFetching from "../common/ErrorFetching"
import {
	useFavoriteDoctorsList,
	useSearchDoctors,
	useSpecialityList,
	useTopDoctorsList,
} from "@/hooks/useDoctors"
import DoctorsListCard from "./DoctorsListCard"
import SearchBarCard from "./SearchBarCard"
import { RefreshableScrollView } from "../common/RefreshableScrollView"
import { useRefreshData } from "@/hooks/useRefreshData"

export default function HomeCard() {
	const [showFavorites, setShowFavorites] = useState(true)
	const [query, setQuery] = useState("")

	const {
		data: viewFavoriteDoctors,
		isLoading: viewFavoriteDoctorsIsLoading,
		isError: viewFavoriteDoctorsIsError,
		refetch: refetchFavoriteDoctors,
	} = useFavoriteDoctorsList()

	const {
		data: viewTopDoctors,
		isLoading: viewTopDoctorsIsLoading,
		isError: viewTopDoctorsIsError,
		refetch: refetchTopDoctors,
	} = useTopDoctorsList()

	const {
		data: viewSpecialities,
		isLoading: viewSpecialitiesIsLoading,
		isError: viewSpecialitiesIsError,
		refetch: refetchSpecialities,
	} = useSpecialityList()

	const {
		data: viewSearch,
		isLoading: searchIsLoading,
		isError: searchIsError,
	} = useSearchDoctors(query)

	const favoriteDoctorsList = JSON.parse(
		viewFavoriteDoctors?.userStringify || "{}"
	)

	const { onRefresh } = useRefreshData([
		refetchFavoriteDoctors,
		refetchTopDoctors,
		refetchSpecialities,
	])

	if (
		viewFavoriteDoctorsIsLoading ||
		viewTopDoctorsIsLoading ||
		viewSpecialitiesIsLoading
	) {
		return <LoadingScreen />
	}

	if (
		viewFavoriteDoctorsIsError ||
		viewTopDoctorsIsError ||
		viewSpecialitiesIsError
	) {
		return <ErrorFetching />
	}

	return (
		<RefreshableScrollView className="flex-1 bg-blue-50" onRefresh={onRefresh}>
			{/* Welcome Section */}
			<View className="h-56 p-6 bg-blue-600">
				<Text className="text-lg text-blue-100">
					Hi, {favoriteDoctorsList.name}
				</Text>
				<Text className="text-3xl font-bold text-white mt-2">Welcome Back</Text>

				{/* Search Bar Component */}
				<SearchBarCard
					query={query}
					setQuery={setQuery}
					viewSearch={viewSearch}
					searchIsLoading={searchIsLoading}
					searchIsError={searchIsError}
				/>
			</View>

			<View className="bg-blue-50 rounded-t-3xl -mt-4 pt-3">
				{/* Speciality Section */}
				<SpecialityCard specialities={viewSpecialities.specialities} />

				{/* Filter Buttons */}
				<View className="flex-row justify-around my-6 mx-4">
					<TouchableOpacity
						className={`px-8 py-3 rounded-full ${
							showFavorites ? "bg-blue-600" : "bg-gray-200"
						}`}
						onPress={() => setShowFavorites(true)}
					>
						<Text
							className={`font-semibold ${
								showFavorites ? "text-white" : "text-gray-600"
							}`}
						>
							Favorite Doctors
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`px-8 py-3 rounded-full ${
							!showFavorites ? "bg-blue-600" : "bg-gray-200"
						}`}
						onPress={() => setShowFavorites(false)}
					>
						<Text
							className={`font-semibold ${
								!showFavorites ? "text-white" : "text-gray-600"
							}`}
						>
							Top Doctors
						</Text>
					</TouchableOpacity>
				</View>

				{/* Doctors List */}
				<DoctorsListCard
					doctors={
						showFavorites
							? favoriteDoctorsList?.favorites
							: viewTopDoctors?.doctors
					}
				/>
			</View>
		</RefreshableScrollView>
	)
}
