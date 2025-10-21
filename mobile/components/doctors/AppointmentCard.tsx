import useAxiosAuth from "@/hooks/useAxiosAuth"
import { bookAppointment } from "@/lib/services/api"
import { AppointmentData } from "@/lib/types/types"
import {
	convertTo24HourFormat,
	formatDate,
	formatTime,
	generateTimeSlots,
	getMonthDates,
} from "@/lib/utils"
import { MaterialIcons } from "@expo/vector-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import {
	View,
	Text,
	TouchableOpacity,
	Alert,
	FlatList,
	Image,
} from "react-native"

export default function AppointmentCard() {
	const { doctorData, speciality_slug } = useLocalSearchParams()
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [selectedTime, setSelectedTime] = useState<string | null>(null)
	const [currentMonth, setCurrentMonth] = useState(new Date()) // Track the selected month
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: (appointmentData: AppointmentData) =>
			bookAppointment(appointmentData, axiosAuth),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["appointmentList"],
			})
			Alert.alert(
				"Appointment Confirmed",
				`Your appointment is booked for ${formatDate(
					selectedDate!.toISOString()
				)} at ${selectedTime}`
			)

			router.push("/(tabs)/appointments")
		},
		onError: (error: any) => {
			Alert.alert(
				"Booking Failed",
				error?.response?.data?.message ||
					"Something went wrong. Please try again."
			)
		},
	})

	const doctor = JSON.parse(String(doctorData))

	const monthDates = getMonthDates(currentMonth)

	const timeSlots = generateTimeSlots()

	// Handle Confirm button
	const handleConfirm = () => {
		if (selectedDate && selectedTime) {
			// Prepare the data for the appointment
			const appointmentData: AppointmentData = {
				docId: doctor._id, // Assuming doctor.id is available
				slotDate: selectedDate.toISOString(), // Format the date as ISO string
				slotTime: convertTo24HourFormat(selectedTime),
			}
			// Call the mutation
			mutation.mutate(appointmentData)
			// console.log(appointmentData)
		} else {
			Alert.alert("Incomplete Selection", "Please select both a date and time.")
		}
	}

	// Navigate to the previous month
	const handlePreviousMonth = () => {
		const now = new Date()
		const isCurrentMonth =
			currentMonth.getMonth() === now.getMonth() &&
			currentMonth.getFullYear() === now.getFullYear()

		if (isCurrentMonth) {
			return // Disable navigation if already on the current month
		}

		setCurrentMonth(
			(prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
		)
	}

	// Navigate to the next month
	const handleNextMonth = () => {
		setCurrentMonth(
			(prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
		)
	}

	return (
		<View className="flex-1 bg-blue-500">
			<View className="flex-row items-center gap- py-4">
				<View className="bg-white items-center h-28 w-28 rounded-full overflow-hidden ml-4">
					<Image
						source={{ uri: doctor.image }}
						className="w-full h-full object-cover"
					/>
				</View>

				<View className="ml-8">
					{/* Doctor Name */}
					<Text className="text-xl font-bold text-white">{doctor.name}</Text>
					{/* Specialty */}
					<Text className="text-base text-white">{doctor.speciality}</Text>
					{/* Fees */}
					<Text className="text-base text-white">${doctor.fees}</Text>
					{/* Rating */}
					{doctor.ratings.average ? (
						<View className="flex-row items-center">
							{[1, 2, 3, 4, 5].map((star) => (
								<MaterialIcons
									key={star}
									name={doctor.ratings.average >= star ? "star" : "star-border"}
									size={20}
									color={doctor.ratings.average >= star ? "#FFD700" : "#CCCCCC"}
								/>
							))}
						</View>
					) : (
						<Text>No ratings yet</Text>
					)}
				</View>
			</View>
			<View className="flex-1 bg-gray-100 p-4">
				{/* Month Selector */}
				<View className="flex-row justify-between items-center mb-4">
					<TouchableOpacity
						onPress={handlePreviousMonth}
						className={`px-4 py-2 bg-gray-300 rounded-lg ${
							currentMonth.getMonth() === new Date().getMonth() &&
							currentMonth.getFullYear() === new Date().getFullYear()
								? "opacity-50"
								: ""
						}`}
						disabled={
							currentMonth.getMonth() === new Date().getMonth() &&
							currentMonth.getFullYear() === new Date().getFullYear()
						}
					>
						<MaterialIcons name="navigate-before" size={24} color="black" />
					</TouchableOpacity>
					<Text className="text-lg font-bold">
						{currentMonth.toLocaleDateString("en-US", {
							month: "long",
							year: "numeric",
						})}
					</Text>
					<TouchableOpacity
						onPress={handleNextMonth}
						className="px-4 py-2 bg-gray-300 rounded-lg"
					>
						<MaterialIcons name="navigate-next" size={24} color="black" />
					</TouchableOpacity>
				</View>

				{/* Date Selection */}
				<Text className="text-lg font-semibold mb-2">Select a Date:</Text>
				<View>
					<FlatList
						data={monthDates}
						keyExtractor={(item) => item.toISOString()}
						horizontal
						contentContainerStyle={{ gap: 8 }}
						renderItem={({ item }) => (
							<TouchableOpacity
								className={`py-3 px-4 rounded-lg ${
									selectedDate?.toDateString() === item.toDateString()
										? "bg-blue-500"
										: "bg-gray-300"
								}`}
								onPress={() =>
									setSelectedDate(
										selectedDate?.toDateString() === item.toDateString()
											? null
											: item
									)
								}
							>
								<Text
									className={`text-lg font-semibold ${
										selectedDate?.toDateString() === item.toDateString()
											? "text-white"
											: "text-black"
									}`}
								>
									{formatDate(item.toISOString())}
								</Text>
							</TouchableOpacity>
						)}
					/>
				</View>

				{/* Time Selection */}
				<Text className="text-lg font-semibold mt-6 mb-2">Select a Time:</Text>
				<View>
					<FlatList
						data={timeSlots}
						keyExtractor={(item, index) => index.toString()}
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8 }}
						renderItem={({ item }) => {
							// Format the selected date to match the format in doctor.slots_booked (i.e., ISO string)
							const selectedDateString = selectedDate?.toISOString() || ""

							// Check if the time slot is booked for the selected date
							const isBooked =
								doctor.slots_booked?.[selectedDateString]?.includes(item) ===
								true

							return (
								<TouchableOpacity
									className={`py-3 px-4 rounded-lg ${
										selectedTime === item
											? "bg-green-500"
											: isBooked
											? "bg-gray-400" // Show as disabled if booked
											: "bg-gray-300"
									}`}
									onPress={() => {
										// Only allow selecting the time if it's not booked
										if (!isBooked) {
											setSelectedTime(selectedTime === item ? null : item)
										}
									}}
									disabled={isBooked} // Disable button if the time slot is already booked
								>
									<Text
										className={`text-lg font-semibold ${
											selectedTime === item
												? "text-white"
												: isBooked
												? "text-gray-600" // Text color for booked slots
												: "text-black"
										}`}
									>
										{item}
									</Text>
								</TouchableOpacity>
							)
						}}
					/>
				</View>

				{/* Confirm Button */}
				<TouchableOpacity
					className="bg-blue-700 py-3 px-6 rounded-lg mt-8 items-center"
					onPress={handleConfirm}
				>
					<Text className="text-white font-semibold text-lg">Confirm</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
