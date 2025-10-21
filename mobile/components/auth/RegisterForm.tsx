import { View, Text, TextInput, Button, Image, Alert } from "react-native"
import React, { useState } from "react"
import * as ImagePicker from "expo-image-picker"
import { useForm, Controller } from "react-hook-form"
import { Link } from "expo-router"
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons"
import { RegisterFormData, RegisterResponse } from "@/lib/types/types"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/lib/services/auth"

export default function RegisterForm() {
	const [image, setImage] = useState<string | null>(null)
	const axiosAuth = useAxiosAuth()
	const router = useRouter() // Initialize useRouter for navigation

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		setError,
		formState: { errors },
	} = useForm<RegisterFormData>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			image: "",
		},
	}) // Type the form

	const mutation = useMutation({
		mutationFn: (formData: FormData) => registerUser(formData, axiosAuth),
		onSuccess: async (data: RegisterResponse) => {
			const token = data.token
			await SecureStore.setItemAsync("jwtToken", token)
			Alert.alert("Success", data.message)
			reset()
			router.push("/home")
		},
		onError: (error: any) => {
			// if (error.response && error.response.data && error.response.data.errors) {
			// Loop through the array of errors from the backend
			error.response.data.errors.forEach((err: any) => {
				const fieldPath = err.path as keyof RegisterFormData // Access the field path (e.g., 'email' or 'password')
				setError(fieldPath, {
					type: "manual", // The type of error, 'manual' since we're manually setting this
					message: err.msg, // Set the error message from the backend
				})
			})
			console.log(error.response)
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

	const onSubmit = (data: RegisterFormData) => {
		const formData = new FormData()

		formData.append("name", data.name)
		formData.append("email", data.email)
		formData.append("password", data.password)

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

	return (
		<View className="flex items-center w-full">
			{/* Profile Image Picker */}
			<View className="mb-4">
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
				{image ? (
					<Image
						className="relative w-20 h-20 z-10 rounded-full"
						source={{ uri: image }}
						// style={{ zIndex: 10 }}
					/>
				) : (
					<View className="relative w-20 h-20 z-10 rounded-full">
						<FontAwesome6 name="user-circle" size={70} color="#ADD8E6" />
					</View>
				)}
			</View>

			{/* Full Name Input */}
			<View className="w-full mb-4">
				<Text className="text-lg font-semibold text-blue-800">Full Name</Text>
				<Controller
					control={control}
					render={({ field: { onChange, value } }) => (
						<TextInput
							className="border border-blue-500 rounded-lg p-3 w-full mt-1.5"
							placeholder="Enter your full name"
							onChangeText={onChange}
							value={value}
						/>
					)}
					name="name"
				/>
				{errors.name && (
					<Text className="text-red-500 pl-3 pt-1">{errors.name.message}</Text>
				)}
			</View>

			{/* Email Input */}
			<View className="w-full mb-4">
				<Text className="text-lg font-semibold text-blue-800">Email</Text>
				<Controller
					control={control}
					render={({ field: { onChange, value } }) => (
						<TextInput
							className="border border-blue-800 rounded-lg p-3 w-full mt-1.5"
							placeholder="Enter your email"
							keyboardType="email-address"
							autoCapitalize="none"
							onChangeText={onChange}
							value={value}
						/>
					)}
					name="email"
				/>
				{errors.email && (
					<Text className="text-red-500 pl-3 pt-1">{errors.email.message}</Text>
				)}
			</View>

			{/* Password Input */}
			<View className="w-full mb-6">
				<Text className="text-lg font-semibold text-blue-800">Password</Text>
				<Controller
					control={control}
					render={({ field: { onChange, value } }) => (
						<TextInput
							className="border border-blue-800 rounded-lg p-3 w-full mt-1.5"
							placeholder="Enter your password"
							secureTextEntry
							onChangeText={onChange}
							value={value}
						/>
					)}
					name="password"
				/>
				{errors.password && (
					<Text className="text-red-500 pl-3 pt-1">
						{errors.password.message}
					</Text>
				)}
			</View>

			{/* Register Button */}
			<View className="w-full mb-4">
				<Button
					title={mutation.isPending ? "Registering..." : "Register"}
					onPress={handleSubmit(onSubmit)}
					disabled={mutation.isPending} // Disable the button while loading
				/>
			</View>
		</View>
	)
}
