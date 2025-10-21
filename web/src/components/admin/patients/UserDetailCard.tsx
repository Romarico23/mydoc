"use client"

import React from "react"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { PatientData } from "@/types/types"
import LoadingComponent from "@/components/ui/loadingComponent"
import { useParams } from "next/navigation"
import { calculateAge, formatDate } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, CircleX, UserRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { viewUserDetail } from "@/lib/services/adminApi"

function UserDetailCard() {
	const axiosAuth = useAxiosAuth()
	const { userId } = useParams() as { userId?: string } // Ensure it's optional
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewUser,
		isLoading,
		isError,
	} = useQuery<PatientData>({
		queryFn: () => viewUserDetail(userId!, axiosAuth), // Use '!' because it won't be undefined due to enabled check
		queryKey: ["userDetail", userId],
		enabled: !!userId, // Prevents fetching when userId is undefined
	})

	if (!userId) return <div>Invalid user ID.</div> // Handle undefined ID case
	if (isLoading) return <LoadingComponent />
	if (isError) return <div>Error loading patient details.</div>

	console.log(viewUser)

	return (
		<div className="p-2">
			<div className="space-y-4">
				<div className="flex flex-col items-center justify-center space-y-4">
					<div className="w-32 h-w-32 bg-blue-100 rounded-sm shadow-sm flex items-center justify-center">
						{viewUser?.user.image !== null ? (
							<img
								src={viewUser?.user.image}
								alt={viewUser?.user.name}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="py-6">
								<UserRound size={54} />
							</div>
						)}
					</div>
				</div>
				<p>
					<span className="font-bold">Patient: </span>
					{viewUser?.user.name}
				</p>
				<p>
					<span className="font-bold">Email: </span>
					{viewUser?.user.email}
				</p>
				<p>
					<span className="font-bold">Gender: </span>
					{viewUser?.user.gender}
				</p>
				<p>
					<span className="font-bold">Phone: </span>
					{viewUser?.user.phone}
				</p>
				<p>
					<span className="font-bold">Address: </span>
					{viewUser?.user?.address.line1 && viewUser?.user?.address.line2
						? `${viewUser.user.address.line1} ${viewUser.user.address.line2}`
						: "N/A"}
				</p>
				<p>
					<span className="font-bold">Birth Date: </span>
					{viewUser?.user.birthDate &&
					!isNaN(new Date(viewUser.user.birthDate).getTime())
						? formatDate(new Date(viewUser.user.birthDate)) // Ensure it's a Date object
						: "N/A"}
				</p>
				<p>
					<span className="font-bold">Age: </span>
					{viewUser?.user.birthDate &&
					new Date(viewUser.user.birthDate).toString() !== "Invalid Date"
						? calculateAge(viewUser.user.birthDate.toString())
						: "N/A"}
				</p>
			</div>
		</div>
	)
}

export default UserDetailCard
