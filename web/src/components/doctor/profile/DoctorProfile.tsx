"use client"

import React from "react"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import LoadingComponent from "../../ui/loadingComponent"
import { changeAvailability, viewDoctorProfile } from "@/lib/services/doctorApi"
import { DoctorProfileData } from "@/types/types"
import { formatDate } from "../../../lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "../../ui/button"
import { useToast } from "@/hooks/use-toast"

function DoctorProfile() {
	const axiosAuth = useAxiosAuth()
	const router = useRouter()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewProfile,
		isLoading: viewProfileIsLoading,
		isError: viewProfileIsError,
	} = useQuery<DoctorProfileData>({
		queryFn: () => viewDoctorProfile(axiosAuth),
		queryKey: ["doctorProfile"],
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
			queryClient.invalidateQueries({ queryKey: ["doctorProfile"] })
		},
		onError: (error: any) => {
			console.log(error)
			toast({
				title: "Unable to Change Availability",
				description: error.response.data.message,
			})
		},
	})

	const handleCheckbox = (docId: string) => {
		mutation.mutate(docId)
	}

	if (viewProfileIsLoading) return <LoadingComponent />
	if (viewProfileIsError) return <div>Error loading profile.</div>

	// console.log(viewProfile?.doctor._id)

	return (
		<div className="flex flex-col p-5 space-y-4">
			{/* Profile Image and Name */}
			<div className="flex flex-col items-center justify-center space-y-4">
				<div className="w-32 h-w-32 bg-blue-100 rounded-sm shadow-sm">
					<img
						src={viewProfile?.doctor?.image}
						alt={viewProfile?.doctor?.name}
						className="w-full h-full object-cover"
					/>
				</div>
				<h2 className="text-2xl font-bold">{viewProfile?.doctor?.name}</h2>

				<div className="mt-4">
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={viewProfile?.doctor?.available}
							// onChange={() => handleCheckbox(viewProfile?.doctor._id)} // Handle checkbox change
							onChange={() => handleCheckbox(viewProfile!.doctor!._id)}
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

			{/* Contact Information */}
			<div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-lg">
				<h3 className="text-lg font-semibold mb-2">CONTACT INFORMATION</h3>
				<p>
					<strong>Email:</strong> {viewProfile?.doctor?.email}
				</p>
				<p>
					<strong>Address:</strong> {viewProfile?.doctor?.address.line1}{" "}
					{viewProfile?.doctor?.address.line2}
				</p>
			</div>

			{/* Basic Information */}
			<div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-lg">
				<h3 className="text-lg font-semibold mb-2">BASIC INFORMATION</h3>

				<p>
					<strong>Experience:</strong> {viewProfile?.doctor?.experience}
				</p>
				<p>
					<strong>Fees:</strong> {viewProfile?.doctor?.fees}
				</p>
				<p>
					<strong>Speciality:</strong> {viewProfile?.doctor?.speciality}
				</p>
				<p>
					<strong>Degree:</strong> {viewProfile?.doctor?.degree}
				</p>
				<p>
					<strong>About:</strong> {viewProfile?.doctor?.about}
				</p>
			</div>

			<div className="flex space-x-4">
				<Button
					// className="px-4 py-2 rounded"
					onClick={() => router.push("/doctor/profile/update")}
				>
					Update Profile
				</Button>
			</div>
		</div>
	)
}

export default DoctorProfile
