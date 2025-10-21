import {
	View,
	Text,
	Image,
	Button,
	TextInput,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native"
import React, { useMemo, useState } from "react"
import { Link, useRouter } from "expo-router"
import { updateUserProfile, viewUserProfile } from "@/lib/services/api"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { UpdateUserFormData, UpdateUserResponse } from "@/lib/types/types"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
	GestureHandlerRootView,
	TouchableOpacity,
} from "react-native-gesture-handler"
import LoadingScreen from "../common/LoadingScreen"
import ErrorFetching from "../common/ErrorFetching"
import { useProfile } from "@/hooks/useProfile"

export default function UpdateProfileForm() {
	const router = useRouter()
	const [image, setImage] = useState<string | null>(null)
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()

	const {
		data: viewUser,
		isLoading: viewUserIsLoading,
		isError: viewUserIsError,
	} = useProfile()

	const {
		control,
		handleSubmit,
		setValue,
		setError,
		formState: { errors },
	} = useForm<UpdateUserFormData>({
		defaultValues: {
			name: viewUser?.name,
			email: viewUser?.email,
			phone: viewUser?.phone,
			gender: viewUser?.gender,
			birthDate: viewUser?.birthDate,
			address: {
				line1: viewUser?.address?.line1,
				line2: viewUser?.address?.line2,
			},
			image: "",
		},
	})

	// const mutation = useMutation({
	// 	mutationFn: (formData: FormData) => updateUserProfile(formData, axiosAuth),
	// 	onSuccess: (data: UpdateUserResponse) => {
	// 		Alert.alert("Success", data.message)
	// 		// Redirect to the /home page after successful login
	// 		router.navigate("/(tabs)/profile") // Navigate back or reload page
	// 	},
	// 	onError: (error: any) => {
	// 		error.response.data.errors.forEach((err: any) => {
	// 			const fieldPath = err.path as keyof UpdateUserFormData // Access the field path (e.g., 'email' or 'password')
	// 			setError(fieldPath, {
	// 				type: "manual", // The type of error, 'manual' since we're manually setting this
	// 				message: err.msg, // Set the error message from the backend
	// 			})
	// 		})
	// 	},
	// })

	const mutation = useMutation({
		mutationFn: (formData: FormData) => updateUserProfile(formData, axiosAuth),
		onMutate: async (formData: FormData) => {
			// Cancel any outgoing queries for the user profile to avoid conflicts
			await queryClient.cancelQueries({ queryKey: ["userProfile"] })

			// Snapshot the current state
			const previousUserData = queryClient.getQueryData(["userProfile"])

			// Optimistically update the cache with new data
			queryClient.setQueryData(["userProfile"], (old: any) => ({
				...old,
				...Object.fromEntries(formData), // Apply the updated data
			}))

			// Return a context with the previous data so we can rollback if necessary
			return { previousUserData }
		},
		onSuccess: async (data: UpdateUserResponse) => {
			Alert.alert("Success", data.message)
			queryClient.invalidateQueries({ queryKey: ["userProfile"] })
			router.push("/(tabs)/profile") // Navigate back or reload page
		},
		onError: (error: any, variables, context) => {
			// Rollback the optimistic update
			queryClient.setQueryData(["userProfile"], context?.previousUserData)

			// Handle backend errors
			error.response.data.errors.forEach((err: any) => {
				const fieldPath = err.path as keyof UpdateUserFormData // Access the field path (e.g., 'email' or 'password')
				setError(fieldPath, {
					type: "manual", // The type of error, 'manual' since we're manually setting this
					message: err.msg, // Set the error message from the backend
				})
			})
		},
	})

	const handleImagePick = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 1,
		})

		if (!result.canceled) {
			const uri = result.assets[0].uri
			// Update image state for preview
			setImage(uri)

			// Update the image value in React Hook Form
			setValue("image", uri)
		} else {
			alert("No image selected.")
		}
	}

	const onSubmit = async (data: UpdateUserFormData) => {
		const formData = new FormData()

		formData.append("name", data.name)
		formData.append("email", data.email)
		formData.append("phone", data.phone)
		formData.append("address", JSON.stringify(data.address))
		formData.append("birthDate", data.birthDate)
		formData.append("gender", data.gender)

		// Only append image if it exists and is not null
		if (data.image) {
			const uri = data.image
			const filename = uri.split("/").pop() || "profile.jpg" // Default filename
			const type = `image/${filename.split(".").pop()}` // File extension

			const file = {
				uri: uri,
				name: filename,
				type: type,
			}

			formData.append("image", file as any) // Append the image file
		}
		mutation.mutate(formData)
	}

	if (viewUserIsLoading) {
		return <LoadingScreen />
	}

	if (viewUserIsError) {
		return <ErrorFetching />
	}

	return (
		<View>
			<View className="flex items-center mb-6 pt-3">
				{/* Profile Image Picker */}

				<View>
					<MaterialCommunityIcons
						name="image-plus"
						color="black"
						size={30}
						onPress={handleImagePick}
						style={{
							position: "absolute",
							bottom: 0,
							left: 48,
							opacity: 0.6,
							zIndex: 20,
						}}
					/>
					{/* Check if image is set and display accordingly */}
					{image && typeof image === "string" && image.trim() !== "" ? (
						<Image
							className="relative w-20 h-20 z-10 rounded-full"
							source={{
								uri: image,
							}}
						/>
					) : viewUser.image &&
					  typeof viewUser.image === "string" &&
					  viewUser.image.trim() !== "" ? (
						<Image
							className="relative w-20 h-20 z-10 rounded-full"
							source={{
								uri: viewUser.image,
							}}
						/>
					) : (
						<FontAwesome6 name="user-circle" size={70} color="#ADD8E6" />
					)}
				</View>

				<View className="space-y-2">
					<Controller
						control={control}
						render={({ field: { onChange, value } }) => (
							<TextInput
								className="bg-gray-50 rounded-lg px-4 py-2 text-2xl font-bold text-gray-900 text-center"
								onChangeText={onChange}
								defaultValue={viewUser.name}
								value={value}
							/>
						)}
						name="name"
					/>
					{errors.name && (
						<Text className="text-red-500 text-center">
							{errors.name.message}
						</Text>
					)}
				</View>
			</View>
			<View className="mb-6 space-y-3">
				<Text className="text-lg underline font-semibold text-gray-800">
					CONTACT INFORMATION
				</Text>

				{/* Email */}
				<View className="space-y-2">
					<View className="flex flex-row items-center justify-between">
						<Text className="font-semibold text-blue-800">Email:</Text>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									className="bg-gray-50 rounded-lg p-2 w-64"
									keyboardType="email-address"
									autoCapitalize="none"
									onChangeText={onChange}
									defaultValue={viewUser.email}
									value={value}
								/>
							)}
							name="email"
						/>
					</View>
					{errors.email && (
						<Text className="text-red-500 ">{errors.email.message}</Text>
					)}
				</View>

				{/* Phone */}
				<View className="space-y-2">
					<View className="flex flex-row items-center justify-between">
						<Text className="font-semibold text-blue-800">Phone:</Text>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									className="bg-gray-50 rounded-lg p-2 w-64"
									onChangeText={onChange}
									defaultValue={viewUser.phone}
									value={value.toString()}
								/>
							)}
							name="phone"
						/>
					</View>
					{errors.phone && (
						<Text className="text-red-500">{errors.phone.message}</Text>
					)}
				</View>

				{/* Address */}
				<View className="flex flex-row items-center justify-between">
					<Text className="text-blue-800 font-semibold">Address:</Text>
					<View>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									className="bg-gray-50 rounded-lg p-2 mb-2 w-64"
									onChangeText={onChange}
									placeholder="Address Line 1"
									defaultValue={viewUser.address.line1}
									value={value}
								/>
							)}
							name="address.line1"
						/>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									className="bg-gray-50 rounded-lg p-2 w-64"
									onChangeText={onChange}
									placeholder="Address Line 2"
									defaultValue={viewUser.address.line2}
									value={value}
								/>
							)}
							name="address.line2"
						/>
					</View>
				</View>
			</View>

			<View className="mb-4 space-y-3">
				<Text className="text-lg underline font-semibold text-gray-800">
					BASIC INFORMATION
				</Text>

				{/* Gender */}
				<View className="flex flex-row items-center justify-between">
					<Text className="font-semibold text-blue-800">Gender</Text>
					<Controller
						control={control}
						render={({ field: { onChange, value } }) => (
							<View className="bg-gray-50 rounded-lg w-64">
								<Picker
									selectedValue={value || viewUser?.gender}
									onValueChange={(itemValue) => onChange(itemValue)}
								>
									<Picker.Item
										// label={viewUser.gender}
										label="Select Gender"
										value=""
										enabled={false}
										style={{ color: "gray", fontSize: 14 }}
									/>
									<Picker.Item label="Male" value="Male" />
									<Picker.Item label="Female" value="Female" />
								</Picker>
							</View>
						)}
						name="gender"
					/>
				</View>

				{/* Birth Date */}

				<View className="flex flex-row items-center justify-between">
					<Text className="font-semibold text-blue-800">Birth Date</Text>
					<Controller
						control={control}
						render={({ field: { onChange, value } }) => {
							const [showPicker, setShowPicker] = useState(false)

							const handleDateChange = (event: any, selectedDate: any) => {
								setShowPicker(false)
								if (selectedDate) {
									onChange(selectedDate.toISOString()) // Ensure ISO format for backend compatibility
								}
							}

							const dateValue = value
								? new Date(value)
								: viewUser?.birthDate
								? new Date(viewUser.birthDate)
								: new Date()

							const pickerDate =
								dateValue && !isNaN(dateValue.getTime())
									? dateValue
									: new Date()

							const formattedDate = dateValue.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})

							return (
								<View className="bg-gray-50 rounded-lg p-1.5 w-64">
									{/* Button to show Date Picker */}
									<GestureHandlerRootView>
										<TouchableOpacity
											onPress={() => setShowPicker(true)}
											className="p-2"
										>
											<Text className="text-gray-500">
												{value === "Select Birth Date"
													? "Select Date"
													: value && formattedDate}
											</Text>
										</TouchableOpacity>
									</GestureHandlerRootView>

									{/* DateTimePicker only shows when triggered */}
									{showPicker && (
										<DateTimePicker
											value={pickerDate} // Pass Date object to the picker
											mode="date"
											display="default"
											onChange={handleDateChange}
											maximumDate={new Date()} // Limit to past dates
										/>
									)}
								</View>
							)
						}}
						name="birthDate"
					/>
				</View>
			</View>
			{/* <View className="flex-row justify-between mt-6"> */}
			<View className="pb-6">
				<Button
					title={mutation.isPending ? "Saving..." : "Save Profile"}
					onPress={handleSubmit(onSubmit)}
					disabled={mutation.isPending}
				/>
			</View>
		</View>
	)
}
