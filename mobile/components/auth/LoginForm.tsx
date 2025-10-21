import { View, Text, TextInput, Button, Alert } from "react-native"
import React from "react"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import * as SecureStore from "expo-secure-store"
import { LoginFormData, LoginResponse } from "@/lib/types/types"
import { loginUser } from "@/lib/services/auth"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { useRouter } from "expo-router"

export default function LoginForm() {
	const axiosAuth = useAxiosAuth()
	const router = useRouter() // Initialize useRouter for navigation

	const {
		control,
		handleSubmit,
		reset,
		setError,
		formState: { errors },
	} = useForm<LoginFormData>({
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const mutation = useMutation({
		mutationFn: (formData: FormData) => loginUser(formData, axiosAuth),
		onSuccess: async (data: LoginResponse) => {
			const token = data.token
			await SecureStore.setItemAsync("jwtToken", token)
			Alert.alert("Success", data.message)
			reset()
			router.replace("/home")
		},
		onError: (error: any) => {
			// if (error.response && error.response.data && error.response.data.errors) {
			// Loop through the array of errors from the backend
			error.response.data.errors.forEach((err: any) => {
				const fieldPath = err.path as keyof LoginFormData // Access the field path (e.g., 'email' or 'password')

				setError(fieldPath, {
					type: "manual", // The type of error, 'manual' since we're manually setting this
					message: err.msg, // Set the error message from the backend
				})
			})
			// } else {
			// 	Alert.alert("Login Failed", "An unknown error occurred")
			// }
		},
	})

	const onSubmit = (data: LoginFormData) => {
		const formData = new FormData()
		formData.append("email", data.email)
		formData.append("password", data.password)
		mutation.mutate(formData)
	}

	return (
		<View className="w-full">
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

			{/* Login Button */}
			<View className="w-full mb-4">
				<Button
					title={mutation.isPending ? "Logging in..." : "Login"}
					onPress={handleSubmit(onSubmit)}
					disabled={mutation.isPending} // Disable button while loading
				/>
			</View>
		</View>
	)
}
