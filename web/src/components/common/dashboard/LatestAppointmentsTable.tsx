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
import { CircleX, Notebook } from "lucide-react"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { viewAdminDashboard } from "@/lib/services/adminApi"
import LoadingComponent from "../../ui/loadingComponent"
import { useQuery } from "@tanstack/react-query"
import { AppointmentListProps } from "@/types/types"
import { LatestAppointmentData } from "../../../types/types"
import { formatDate } from "@/lib/utils"

function LatestAppointmentsTable() {
	const axiosAuth = useAxiosAuth()

	const {
		data: viewDashboard,
		isLoading: viewDashboardIsLoading,
		isError: viewDashboardIsError,
	} = useQuery({
		queryFn: () => viewAdminDashboard(axiosAuth),
		queryKey: ["viewDashboard"],
	})

	if (viewDashboardIsLoading) return <LoadingComponent />
	if (viewDashboardIsError) return <div>Error loading appointments.</div>

	return (
		<Table className="mt-10 border border-gray-300 rounded-lg">
			<TableHeader>
				<TableRow className="hover:bg-white">
					<TableHead className="text-2xl font-semibold flex items-center gap-2 py-10">
						<Notebook />
						Latest Appointments
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{viewDashboard?.dashboardData.latestAppointments.map(
					(appointment: AppointmentListProps) => (
						<TableRow key={appointment._id} className="border-none">
							<TableCell className="flex gap-4">
								{appointment.docData.image && (
									<img
										src={appointment.docData.image.toLocaleString()}
										alt={appointment.docData.name}
										className="w-10 h-10 rounded-full"
									/>
								)}
								<div>
									<h6 className="font-semibold">{appointment.docData.name}</h6>
									<p>Booking on {formatDate(new Date(appointment.slotDate))}</p>
								</div>
							</TableCell>
							<TableCell>
								<button className="flex justify-end text-red-500">
									<CircleX />,
								</button>
							</TableCell>
						</TableRow>
					)
				)}
			</TableBody>
		</Table>
	)
}

export default LatestAppointmentsTable
