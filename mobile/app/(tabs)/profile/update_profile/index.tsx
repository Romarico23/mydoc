import { Text, ScrollView } from "react-native"
import React from "react"

import UpdateProfileForm from "@/components/profile/UpdateProfileForm"

export default function UpdateProfileScreen() {
	return (
		<ScrollView className="flex-1 bg-white p-4">
			<Text className="text-left font-bold text-3xl">Update Profile</Text>
			<UpdateProfileForm />
		</ScrollView>
	)
}
