import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import {
	searchDoctors,
	viewDoctorList,
	viewFavoriteDoctorsList,
	viewRatingList,
	viewSpecialityList,
	viewTopDoctorsList,
} from "@/lib/services/api"

export const useSpecialityList = () => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewSpecialityList(axiosAuth),
		queryKey: ["specialityList"],
	})
}

export const useDoctorList = (speciality_slug: string) => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewDoctorList(speciality_slug, axiosAuth),
		queryKey: ["doctorList", speciality_slug],
	})
}

export const useTopDoctorsList = () => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewTopDoctorsList(axiosAuth),
		queryKey: ["topDoctorsList"],
	})
}

export const useFavoriteDoctorsList = () => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewFavoriteDoctorsList(axiosAuth),
		queryKey: ["favoriteDoctorsList"],
	})
}

export const useSearchDoctors = (query: string) => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => searchDoctors(query, axiosAuth),
		queryKey: ["search", query],
		enabled: !!query,
	})
}

export const useRatingList = (docId: string) => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewRatingList(docId, axiosAuth),
		queryKey: ["doctorRatingList", docId],
	})
}

// const {
// 	data: viewSearch,
// 	isLoading: searchIsLoading,
// 	isError: searchIsError,
// } = useQuery({
// 	queryFn: () => searchUsers(query, axiosAuth),
// 	queryKey: ["search", query],
// })
