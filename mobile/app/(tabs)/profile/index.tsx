import { Text, ScrollView } from "react-native"
import ProfileCard from "@/components/profile/ProfileCard"

export default function ProfileScreen() {
	return (
		<ScrollView className="flex-1 bg-white p-4">
			<Text className="text-left font-bold text-3xl">Profile</Text>
			<ProfileCard />
		</ScrollView>
	)
}
