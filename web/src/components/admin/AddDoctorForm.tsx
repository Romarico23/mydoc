"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery } from "@tanstack/react-query"
import { addDoctor, viewSpecialityList } from "@/lib/services/adminApi"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { DoctorFormData } from "@/types/types"

function AddDoctorForm() {
	const { toast } = useToast()
	const axiosAuth = useAxiosAuth()

	const {
		data: viewSpecialities,
		isLoading: viewSpecialitiesIsLoading,
		isError: viewSpecialitiesIsError,
	} = useQuery({
		queryFn: () => viewSpecialityList(axiosAuth),
		queryKey: ["specialityList"],
	})

	const form = useForm<DoctorFormData>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			experience: "",
			fees: "",
			speciality: "",
			degree: "",
			address: {
				line1: "",
				line2: "",
			},
			about: "",
			image: null,
		},
	})

	const mutation = useMutation({
		mutationFn: (formData: FormData) => addDoctor(formData, axiosAuth), // Pass axiosAuth instance
		onSuccess: (data) => {
			toast({
				title: data.message,
				description: <span>Doctor Name: {data.name}</span>,
			})
			form.reset()
		},
		onError: (error: any) => {
			toast({
				title: "Error adding doctor",
				description: error.response.data.message,
			})
			error.response.data.errors.forEach((err: any) => {
				const fieldPath = err.path as keyof DoctorFormData // Access the field path
				form.setError(fieldPath, {
					type: "manual",
					message: err.msg, // Set the error message
				})
			})
		},
	})

	const onSubmit = (data: DoctorFormData) => {
		const formData = new FormData()

		formData.append("name", data.name)
		formData.append("email", data.email)
		formData.append("password", data.password)
		formData.append("experience", data.experience)
		formData.append("fees", data.fees)
		formData.append("speciality", data.speciality)
		formData.append("degree", data.degree)
		formData.append("address", JSON.stringify(data.address))
		formData.append("about", data.about)

		if (data.image && data.image[0]) {
			formData.append("image", data.image[0])
		}

		mutation.mutate(formData)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Doctor Name */}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Doctor name</FormLabel>
								<FormControl>
									<Input placeholder="Name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Speciality */}
					<FormField
						control={form.control}
						name="speciality"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Speciality</FormLabel>
								<FormControl>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger>
											<SelectValue
												placeholder={
													viewSpecialitiesIsLoading
														? "Loading specialities.."
														: viewSpecialitiesIsError
														? "Error loading specialities"
														: "Select Speciality"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{viewSpecialities?.specialities.map(
												(speciality: { _id: string; name: string }) => {
													return (
														<SelectItem
															key={speciality._id}
															value={speciality.name}
														>
															{speciality.name}
														</SelectItem>
													)
												}
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Doctor Email */}
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Doctor Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="Your email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Degree */}
					<FormField
						control={form.control}
						name="degree"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Degree</FormLabel>
								<FormControl>
									<Input placeholder="Degree" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Doctor Password */}
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Doctor Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Address */}
					<FormField
						control={form.control}
						name="address.line1"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Address 1</FormLabel>
								<FormControl>
									<Input placeholder="Address 1" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="address.line2"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Address 2</FormLabel>
								<FormControl>
									<Input placeholder="Address 2" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Experience */}
					<FormField
						control={form.control}
						name="experience"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Experience</FormLabel>
								<FormControl>
									<Input placeholder="Experience" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Fees */}
					<FormField
						control={form.control}
						name="fees"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Fees</FormLabel>
								<FormControl>
									<Input placeholder="Your fees" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* About Me */}
					<FormField
						control={form.control}
						name="about"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>About me</FormLabel>
								<FormControl>
									<Textarea placeholder="Write about yourself" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Doctor Image  */}
					<FormField
						control={form.control}
						name="image"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Upload Image</FormLabel>
								<FormControl>
									<Input
										type="file"
										onChange={(e) => field.onChange(e.target.files)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<Button disabled={mutation.isPending} type="submit" className="mt-4">
					{mutation.isPending ? "Adding..." : "Add doctor"}
				</Button>
			</form>
		</Form>
	)
}

export default AddDoctorForm
