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
import { calculateAge, formatDate } from "../../../lib/utils"
import { CircleX, UserRound } from "lucide-react"
import LoadingComponent from "../../ui/loadingComponent"
import { useToast } from "@/hooks/use-toast"
import { viewPatientList } from "@/lib/services/doctorApi"
import { UserFormData } from "@/types/types"
import Link from "next/link"

function PatientList() {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewPatient,
		isLoading: viewPatientIsLoading,
		isError: viewPatientIsError,
	} = useQuery({
		queryFn: () => viewPatientList(axiosAuth),
		queryKey: ["patientList"],
	})

	if (viewPatientIsLoading) return <LoadingComponent />
	if (viewPatientIsError) return <div>Error loading patients.</div>

	return (
		<div className="w-full overflow-x-auto">
			<Table className="min-w-[600px]">
				<TableHeader>
					<TableRow>
						<TableHead className="font-bold text-black">#</TableHead>
						<TableHead className="font-bold text-black">Name</TableHead>
						<TableHead className="font-bold text-black">Email</TableHead>
						<TableHead className="font-bold text-black">Age</TableHead>
						<TableHead className="font-bold text-black">Gender</TableHead>
						<TableHead className="font-bold text-black">Phone</TableHead>
						<TableHead className="font-bold text-black">Address</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{viewPatient.patients.map((user: UserFormData, index: number) => (
						<TableRow key={user._id}>
							<TableCell className="font-medium">{index + 1}</TableCell>
							<TableCell className="font-medium">
								<Link
									href={`/doctor/patients/${user._id}`} // Navigate to the user's profile page
									className="flex items-center gap-2 hover:text-blue-500"
								>
									<div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
										{user.image !== null ? (
											<img
												src={user.image}
												alt={user.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<UserRound />
										)}
									</div>
									{user.name}
								</Link>
							</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								{user.birthDate
									? new Date(user.birthDate).toString() !== "Invalid Date"
										? calculateAge(user.birthDate).toString()
										: "N/A"
									: "N/A"}
							</TableCell>
							<TableCell>{user.gender}</TableCell>
							<TableCell>{user.phone}</TableCell>
							<TableCell className="text-right">
								{user.address.line1 && user.address.line2
									? `${user.address.line1} ${user.address.line2}`
									: "N/A"}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

export default PatientList
