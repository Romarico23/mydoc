"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
import { addSpeciality } from "@/lib/services/adminApi"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { SpecialityFormData } from "@/types/types"

function AddSpecialityForm() {
	const { toast } = useToast()
	const axiosAuth = useAxiosAuth()

	const form = useForm<SpecialityFormData>({
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			status: true,
			// specialityStatus: true, // Renamed from `status`
			image: null,
		},
	})

	const mutation = useMutation({
		mutationFn: (formData: FormData) => addSpeciality(formData, axiosAuth), // Pass axiosAuth instance
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
				const fieldPath = err.path as keyof SpecialityFormData // Access the field path
				form.setError(fieldPath, {
					type: "manual",
					message: err.msg, // Set the error message
				})
			})
		},
	})

	const onSubmit = (data: SpecialityFormData) => {
		const formData = new FormData()

		formData.append("name", data.name)
		formData.append("slug", data.slug)
		formData.append("description", data.description)
		formData.append("specialityStatus", data.status ? "true" : "false")

		if (data.image && data.image[0]) {
			formData.append("image", data.image[0])
		}
		mutation.mutate(formData)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/*Name*/}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Speciality name</FormLabel>
								<FormControl>
									<Input placeholder="Name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{/*Slug*/}
					<FormField
						control={form.control}
						name="slug"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Slug</FormLabel>
								<FormControl>
									<Input placeholder="Slug" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{/*Description*/}
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input placeholder="Description" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/*Status*/}
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem className="flex items-center space-x-4">
								<FormControl>
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={field.value}
											onChange={(e) => field.onChange(e.target.checked)}
											className="mr-2"
										/>
										{field.value ? "Shown" : "Hidden"}
									</label>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/*Image*/}
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
					{mutation.isPending ? "Adding..." : "Add Speciality"}
				</Button>
			</form>
		</Form>
	)
}

export default AddSpecialityForm
