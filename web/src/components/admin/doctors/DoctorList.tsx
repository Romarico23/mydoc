"use client"

// import DoctorCard from "@/components/common/DoctorCard"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { changeAvailability, viewDoctorList } from "@/lib/services/adminApi"
import { DoctorListProps } from "@/types/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import LoadingComponent from "../../ui/loadingComponent"
import Link from "next/link"

function DoctorList() {
	const axiosAuth = useAxiosAuth()
	const { toast } = useToast()
	const queryClient = useQueryClient()

	const {
		data: viewDoctors,
		isLoading: viewDoctorsIsLoading,
		isError: viewDoctorsIsError,
	} = useQuery({
		queryFn: () => viewDoctorList(axiosAuth),
		queryKey: ["doctorList"],
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
			queryClient.invalidateQueries({ queryKey: ["doctorList"] })
		},
		onError: (error: any) => {
			console.log(error)
			toast({
				title: "Unable to Change Availability",
				description: error.response.data.message,
			})
		},
	})

	if (viewDoctorsIsLoading) return <LoadingComponent />
	if (viewDoctorsIsError) return <div>Error loading doctors.</div>

	return (
		<>
			<div className="flex flex-col gap-4">
				{viewDoctors?.doctors.map((doctor: DoctorListProps) => {
					return (
						<Card key={doctor._id} className="">
							<CardHeader className="bg-cyan-50 rounded-t-xl flex items-center">
								<img
									src={doctor.image}
									alt={doctor.name}
									className="h-60 w-60 object-cover"
								/>
							</CardHeader>

							<CardContent>
								<CardTitle className="text-xl pt-6 pb-1">
									<Link
										href={`/admin/doctors/${doctor._id}`} // Navigate to the user's profile page
										className="hover:text-blue-500"
									>
										{doctor.name}
									</Link>
								</CardTitle>
								<CardDescription>{doctor.speciality}</CardDescription>
								<div className="mt-4">
									<div className="flex items-center space-x-2">
										<input
											type="checkbox"
											checked={doctor.available}
											onChange={() => mutation.mutate(doctor._id)} // Handle checkbox change
										/>
										<label
											htmlFor="terms"
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-checked:text-white peer-checked:bg-blue-500"
										>
											Availability
										</label>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</>
	)
}

export default DoctorList
