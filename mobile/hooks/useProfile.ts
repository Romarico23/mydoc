import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { viewFavoriteDoctorsList, viewUserProfile } from "@/lib/services/api"

export const useProfile = () => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewUserProfile(axiosAuth),
		queryKey: ["userProfile"],
	})
}
