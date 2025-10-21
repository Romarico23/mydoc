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
import { Star } from "lucide-react"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { viewDoctorDashboard } from "@/lib/services/doctorApi"
import LoadingComponent from "../../ui/loadingComponent"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "@/lib/utils"

function PatientReviewsTable() {
	const axiosAuth = useAxiosAuth()

	const {
		data: doctorDashboard,
		isLoading: doctorDashboardIsLoading,
		isError: doctorDashboardIsError,
	} = useQuery({
		queryFn: () => viewDoctorDashboard(axiosAuth),
		queryKey: ["doctorDashboard"],
	})

	if (doctorDashboardIsLoading) return <LoadingComponent />
	if (doctorDashboardIsError) return <div>Error loading reviews.</div>

	return (
		<Table className="mt-10 border border-gray-300 rounded-lg">
			<TableHeader>
				<TableRow className="hover:bg-white">
					<TableHead className="text-2xl font-semibold flex items-center gap-2 py-10">
						⭐ Patient Reviews
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{doctorDashboard?.dashboardData.patientReviews.map(
					(review: {
						_id: string
						patientName: string
						patientImage: string
						rating: number
						comment: string
						appointmentDate: string
					}) => (
						<TableRow key={review._id} className="border-none">
							<TableCell className="flex gap-4 items-center">
								{review.patientImage && (
									<img
										src={review.patientImage}
										alt={review.patientName}
										className="w-10 h-10 rounded-full"
									/>
								)}
								<div>
									<h6 className="font-semibold">{review.patientName}</h6>
									<p className="text-gray-500">
										{formatDate(new Date(review.appointmentDate))}
									</p>
								</div>
							</TableCell>
							<TableCell className="flex items-center gap-2">
								{[...Array(5)].map((_, index) => (
									<Star
										key={index}
										className={`w-4 h-4 ${
											index < Math.round(review.rating)
												? "text-yellow-500"
												: "text-gray-300"
										}`}
									/>
								))}
							</TableCell>
						</TableRow>
					)
				)}
			</TableBody>
		</Table>
	)
}

export default PatientReviewsTable
