import React, { useState } from "react"
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Alert,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

export type RatingModalProps = {
	visible: boolean
	onClose: () => void
	onSubmit: (rating: number, comment?: string) => void // Updated to include optional comment
}

export const RatingModal = ({
	visible,
	onClose,
	onSubmit,
}: RatingModalProps) => {
	const [starRating, setStarRating] = useState<number | null>(null)
	const [comment, setComment] = useState<string>("")
	const handleSubmit = () => {
		if (starRating !== null && starRating > 0) {
			onSubmit(starRating, comment.trim() ? comment : undefined) // Pass comment only if it's not empty
		} else {
			Alert.alert(
				"Invalid Rating",
				"Please select a rating between 1 and 5 stars."
			)
		}
	}

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={onClose}
		>
			<SafeAreaView className="flex-1">
				<View className="flex-1 bg-black/50 justify-center items-center">
					<View className="bg-white p-6 rounded-lg w-80">
						<Text className="text-lg font-semibold mb-4">
							Rate Your Experience
						</Text>

						{/* Star Rating Selection */}
						<View className="flex-row justify-center mb-4">
							{[1, 2, 3, 4, 5].map((rating) => (
								<TouchableOpacity
									key={rating}
									onPress={() => setStarRating(rating)}
								>
									<MaterialIcons
										name={
											starRating && starRating >= rating
												? "star"
												: "star-border"
										}
										size={32}
										color={
											starRating && starRating >= rating ? "#FFD700" : "#CCCCCC"
										}
									/>
								</TouchableOpacity>
							))}
						</View>

						{/* Optional Comment Input */}
						<TextInput
							className="border border-gray-300 p-2 rounded mb-4"
							placeholder="Leave a comment (optional)"
							value={comment}
							onChangeText={setComment}
							multiline
						/>

						{/* Submit Button */}
						<TouchableOpacity
							onPress={handleSubmit}
							className="bg-blue-500 p-2 rounded mt-2"
						>
							<Text className="text-white text-center">Submit Rating</Text>
						</TouchableOpacity>

						{/* Cancel Button */}
						<TouchableOpacity
							onPress={onClose}
							className="bg-gray-500 p-2 rounded mt-2"
						>
							<Text className="text-white text-center">Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</Modal>
	)
}
