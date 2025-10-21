"use client"

import React from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	appointmentCancel,
	appointmentComplete,
	viewAppointmentList,
} from "@/lib/services/adminApi"
import { AppointmentListProps } from "@/types/types"
import { calculateAge, formatDate } from "../../../lib/utils"
import { CheckCircle, CircleX } from "lucide-react"
import LoadingComponent from "../../ui/loadingComponent"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function AppointmentList() {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewAppointment,
		isLoading: viewAppointmentIsLoading,
		isError: viewAppointmentIsError,
	} = useQuery({
		queryFn: () => viewAppointmentList(axiosAuth),
		queryKey: ["appointmentList"],
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
				queryKey: ["appointmentList"],
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
				queryKey: ["appointmentList"],
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

	if (viewAppointmentIsLoading) return <LoadingComponent />
	if (viewAppointmentIsError) return <div>Error loading appointments.</div>

	return (
		<div className="w-full overflow-x-auto">
			<Table className="min-w-[800px]">
				<TableHeader>
					<TableRow>
						<TableHead className="font-bold text-black">#</TableHead>
						<TableHead className="font-bold text-black">Patient</TableHead>
						<TableHead className="font-bold text-black">Department</TableHead>
						<TableHead className="font-bold text-black">Age</TableHead>
						<TableHead className="font-bold text-black">Date & Time</TableHead>
						<TableHead className="font-bold text-black">Doctor</TableHead>
						<TableHead className="font-bold text-black">Fees</TableHead>
						<TableHead className="font-bold text-black">
							Payment Status
						</TableHead>

						<TableHead className="text-center font-bold text-black">
							Action
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{viewAppointment.appointments.map(
						(appointment: AppointmentListProps, index: number) => (
							<TableRow key={appointment._id}>
								<TableCell className="font-medium">{index + 1}</TableCell>
								<TableCell className="font-medium">
									<Link
										href={`/admin/appointments/${appointment._id}`} // Navigate to the user's profile page
										className="flex items-center gap-2 hover:text-blue-500"
									>
										<div className="w-10 h-10 rounded-full overflow-hidden">
											<img
												src={appointment.userData?.image}
												alt={appointment.userData?.name}
												className="w-full h-full object-cover"
											/>
										</div>
										{appointment.userData.name}
									</Link>
								</TableCell>
								<TableCell>{appointment.docData.speciality}</TableCell>
								<TableCell>
									{appointment.userData.birthDate !== "Select Birth Date"
										? calculateAge(appointment.userData.birthDate)
										: "N/A"}
								</TableCell>
								<TableCell>
									{formatDate(new Date(appointment.slotDate))} |{" "}
									{appointment.slotTime}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 rounded-full overflow-hidden">
											<img
												src={appointment.docData.image}
												alt={appointment.docData.name}
												className="w-full h-full object-cover"
											/>
										</div>
										{appointment.docData.name}
									</div>
								</TableCell>
								<TableCell className="text-right">
									${appointment.amount}
								</TableCell>
								<TableCell>
									{appointment.cardPayment
										? "Paid (Card)"
										: appointment.cashPayment
										? "Paid (Cash)"
										: "Unpaid"}
								</TableCell>
								<TableCell>
									<div className="flex justify-center items-center">
										{appointment.cancelled ? (
											<p className="text-red-500">Cancelled</p>
										) : appointment.isCompleted ? (
											<p className="text-green-500">Completed</p>
										) : (
											<>
												<button
													onClick={() => cancelMutation.mutate(appointment._id)}
													className="text-red-500 hover:text-red-300"
												>
													<CircleX />
												</button>
												<button
													onClick={() =>
														completeMutation.mutate(appointment._id)
													}
													className="text-green-500 hover:text-green-300 ml-2"
												>
													<CheckCircle />
												</button>
											</>
										)}
									</div>
								</TableCell>
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
		</div>
	)
}

export default AppointmentList
