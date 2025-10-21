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

function TopDoctorsTable() {
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
	if (viewDashboardIsError) return <div>Error loading top doctors.</div>

	return (
		<Table className="mt-10 border border-gray-300 rounded-lg">
			<TableHeader>
				<TableRow className="hover:bg-white">
					<TableHead className="text-2xl font-semibold flex items-center gap-2 py-10">
						<Notebook />
						Top Doctors
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{viewDashboard?.dashboardData.topDoctors.map(
					(doctor: {
						_id: string
						name: string
						image: string
						specialization: string
						appointmentsCount: number
					}) => (
						<TableRow key={doctor._id} className="border-none">
							<TableCell className="flex gap-4">
								{doctor.image && (
									<img
										src={doctor.image}
										alt={doctor.name}
										className="w-10 h-10 rounded-full"
									/>
								)}
								<div>
									<h6 className="font-semibold">{doctor.name}</h6>
									<p className="text-sm text-gray-500">
										{doctor.specialization}
									</p>
									<p className="text-xs">
										Appointments: {doctor.appointmentsCount}
									</p>
								</div>
							</TableCell>
						</TableRow>
					)
				)}
			</TableBody>
		</Table>
	)
}

export default TopDoctorsTable
