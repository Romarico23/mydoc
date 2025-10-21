"use client"

import React, { useEffect } from "react"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { AppointmentDetailProps } from "@/types/types"
import LoadingComponent from "@/components/ui/loadingComponent"
import { useParams, usePathname } from "next/navigation"
import { calculateAge, formatDate } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CircleX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
	appointmentCancel,
	appointmentComplete,
	markNotificationAsRead,
	viewAppointmentDetail,
} from "@/lib/services/adminApi"

function AppointmentDetailCard() {
	const axiosAuth = useAxiosAuth()
	const { appointmentId } = useParams() as { appointmentId?: string } // Ensure it's optional
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewAppointment,
		isLoading,
		isError,
	} = useQuery<AppointmentDetailProps>({
		queryFn: () => viewAppointmentDetail(appointmentId!, axiosAuth), // Use '!' because it won't be undefined due to enabled check
		queryKey: ["appointmentDetail", appointmentId],
		enabled: !!appointmentId, // Prevents fetching when appointmentId is undefined
	})

	const cancelMutation = useMutation({
		mutationFn: (appointmentId: string) =>
			appointmentCancel(appointmentId, axiosAuth),
		onSuccess: (data) => {
			toast({
				title: data.title,
				description: data.message,
			})
			queryClient.invalidateQueries({
				queryKey: ["appointmentDetail"],
			})
		},
		onError: (error: any) => {
			toast({
				title: "Cancellation Failed",
				description:
					error?.response?.data?.message ||
					"Something went wrong. Please try again.",
			})
		},
	})

	const completeMutation = useMutation({
		mutationFn: (appointmentId: string) =>
			appointmentComplete(appointmentId, axiosAuth),
		onSuccess: (data) => {
			toast({
				title: data.title,
				description: data.message,
			})
			queryClient.invalidateQueries({
				queryKey: ["appointmentDetail"],
			})
		},
		onError: (error: any) => {
			toast({
				title: "Completion Failed",
				description:
					error?.response?.data?.message ||
					"Something went wrong. Please try again.",
			})
		},
	})

	const markAsReadMutation = useMutation({
		mutationFn: (appointmentId: string) =>
			markNotificationAsRead(appointmentId, axiosAuth),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["notificationList"],
			})
		},
		onError: (error: any) => {
			console.error("Mark as read error:", error)
			toast({
				title: "Notification Failed",
				description:
					error?.response?.data?.message ||
					"Something went wrong. Please try again.",
			})
		},
	})

	// Mark notification as read when the component is visited
	useEffect(() => {
		if (appointmentId) {
			markAsReadMutation.mutate(appointmentId)
		}
	}, [appointmentId])

	if (!appointmentId) return <div>Invalid appointment ID.</div> // Handle undefined ID case
	if (isLoading) return <LoadingComponent />
	if (isError) return <div>Error loading appointment details.</div>

	return (
		<div className="p-2">
			<div className="space-y-4">
				<div className="flex flex-col items-center justify-center space-y-4">
					<div className="w-32 h-w-32 bg-blue-100 rounded-sm shadow-sm">
						<img
							src={viewAppointment?.appointment?.userData?.image}
							alt={viewAppointment?.appointment?.userData?.name}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex justify-center items-center">
						{viewAppointment?.appointment?.cancelled ? (
							<p className="text-red-500">Cancelled</p>
						) : viewAppointment?.appointment?.isCompleted ? (
							<p className="text-green-500">Completed</p>
						) : (
							<>
								<button
									onClick={() => cancelMutation.mutate(appointmentId)}
									className="text-red-500 hover:text-red-300"
								>
									<CircleX />
								</button>
								<button
									onClick={() => completeMutation.mutate(appointmentId)}
									className="text-green-500 hover:text-green-300 ml-2"
								>
									<CheckCircle />
								</button>
							</>
						)}
					</div>
				</div>
				<p>
					<span className="font-bold">Patient: </span>
					{viewAppointment?.appointment?.userData?.name}
				</p>
				<p>
					<span className="font-bold">Email: </span>
					{viewAppointment?.appointment?.userData?.email}
				</p>
				<p>
					<span className="font-bold">Gender: </span>
					{viewAppointment?.appointment?.userData?.gender}
				</p>
				<p>
					<span className="font-bold">Phone: </span>
					{viewAppointment?.appointment?.userData?.phone}
				</p>
				<p>
					<span className="font-bold">Address: </span>
					{viewAppointment?.appointment?.userData?.address.line1 &&
					viewAppointment?.appointment?.userData?.address.line2
						? `${viewAppointment?.appointment?.userData?.address.line1} ${viewAppointment?.appointment?.userData?.address.line2}`
						: "N/A"}
					{/* {viewAppointment?.appointment?.userData?.address.line1}
					{viewAppointment?.appointment?.userData?.address.line2} */}
				</p>
				<p>
					<span className="font-bold">Department: </span>
					{viewAppointment?.appointment?.docData?.speciality}
				</p>
				<p>
					<span className="font-bold">Age: </span>
					{viewAppointment?.appointment.userData.birthDate &&
					viewAppointment.appointment.userData.birthDate !== "Select Birth Date"
						? calculateAge(viewAppointment.appointment.userData.birthDate)
						: "N/A"}
				</p>

				<p>
					<span className="font-bold">Date & Time: </span>
					{viewAppointment?.appointment?.slotDate
						? formatDate(new Date(viewAppointment?.appointment?.slotDate))
						: "N/A"}{" "}
					| {viewAppointment?.appointment?.slotTime || "N/A"}
				</p>
				<p>
					<span className="font-bold">Doctor: </span>
					{viewAppointment?.appointment?.docData?.name}
				</p>
				<p>
					<span className="font-bold">Fees: </span> $
					{viewAppointment?.appointment?.amount}
				</p>
				<p>
					<span className="font-bold">Payment Status: </span>
					{viewAppointment?.appointment?.cardPayment
						? "Paid (Card)"
						: viewAppointment?.appointment?.cashPayment
						? "Paid (Cash)"
						: "Unpaid"}
				</p>
				<p>
					<span className="font-bold">Status: </span>
					{viewAppointment?.appointment?.cancelled
						? "Cancelled"
						: viewAppointment?.appointment?.isCompleted
						? "Completed"
						: "Pending"}
				</p>
			</div>
		</div>
	)
}

export default AppointmentDetailCard
