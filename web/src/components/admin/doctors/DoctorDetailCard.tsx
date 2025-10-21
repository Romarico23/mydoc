"use client"

import React from "react"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import {
	appointmentCancel,
	appointmentComplete,
	viewAppointmentDetail,
} from "@/lib/services/doctorApi"
import {
	AppointmentDetailProps,
	DoctorDetailData,
	DoctorListProps,
} from "@/types/types"
import LoadingComponent from "@/components/ui/loadingComponent"
import { useParams } from "next/navigation"
import { calculateAge, formatDate } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CircleX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { changeAvailability, viewDoctorDetail } from "@/lib/services/adminApi"

function DoctorDetailCard() {
	const axiosAuth = useAxiosAuth()
	const { doctorId } = useParams() as { doctorId?: string } // Ensure it's optional
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewDoctor,
		isLoading,
		isError,
	} = useQuery<DoctorDetailData>({
		queryFn: () => viewDoctorDetail(doctorId!, axiosAuth), // Use '!' because it won't be undefined due to enabled check
		queryKey: ["doctorDetail", doctorId],
		enabled: !!doctorId, // Prevents fetching when doctorId is undefined
	})

	const mutation = useMutation({
		mutationFn: (docId: string) => changeAvailability(docId, axiosAuth), // Pass axiosAuth instance// Pass axiosAuth instance
		onSuccess: (data) => {
			toast({
				description: (
					<div className="flex items-center text-green-600 font-bold">
						{data.message}
					</div>
				),
			})
			queryClient.invalidateQueries({ queryKey: ["doctorDetail"] })
		},
		onError: (error: any) => {
			console.log(error)
			toast({
				title: "Unable to Change Availability",
				description: error.response.data.message,
			})
		},
	})

	if (!doctorId) return <div>Invalid doctor ID.</div> // Handle undefined ID case
	if (isLoading) return <LoadingComponent />
	if (isError) return <div>Error loading doctor details.</div>

	return (
		<div className="p-2">
			<div className="space-y-4">
				<div className="flex flex-col items-center justify-center space-y-4">
					<div className="w-32 h-w-32 bg-blue-100 rounded-sm shadow-sm">
						<img
							src={viewDoctor?.doctor.image}
							alt={viewDoctor?.doctor.name}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex justify-center items-center">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								checked={viewDoctor?.doctor.available}
								onChange={() => mutation.mutate(doctorId)} // Handle checkbox change
							/>
							<label
								htmlFor="terms"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-checked:text-white peer-checked:bg-blue-500"
							>
								Availability
							</label>
						</div>
					</div>
				</div>
				<p>
					<span className="font-bold">Name: </span>
					{viewDoctor?.doctor.name}
				</p>
				<p>
					<span className="font-bold">Email: </span>
					{viewDoctor?.doctor.email}
				</p>
				<p>
					<span className="font-bold">Speciality: </span>
					{viewDoctor?.doctor.speciality}
				</p>
				<p>
					<span className="font-bold">Speciality: </span>
					{viewDoctor?.doctor.degree}
				</p>
				<p>
					<span className="font-bold">Speciality: </span>
					{viewDoctor?.doctor.experience}
				</p>
				<p>
					<span className="font-bold">Speciality: </span>
					{viewDoctor?.doctor.about}
				</p>
				<p>
					<span className="font-bold">Speciality: </span>
					{viewDoctor?.doctor.fees}
				</p>
				<p>
					<span className="font-bold">Address: </span>
					{viewDoctor?.doctor.address.line1}
					{viewDoctor?.doctor.address.line2}
				</p>
			</div>
		</div>
	)
}

export default DoctorDetailCard
