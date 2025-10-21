import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { viewAppointmentDetails, viewAppointmentList } from "@/lib/services/api"

export const useAppointmentsList = () => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewAppointmentList(axiosAuth),
		queryKey: ["appointmentList"],
	})
}

export const useAppointmentDetails = (appointmentId: string) => {
	const axiosAuth = useAxiosAuth()
	return useQuery({
		queryFn: () => viewAppointmentDetails(appointmentId!, axiosAuth),
		queryKey: ["appointmentDetails", appointmentId],
		enabled: !!appointmentId, // Prevents fetching when appointmentId is undefined
	})
}
