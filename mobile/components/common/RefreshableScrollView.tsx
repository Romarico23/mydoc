import React, { useState } from "react"
import { ScrollView, RefreshControl, ScrollViewProps } from "react-native"

type RefreshableScrollViewProps = {
	children: React.ReactNode // Specifies that children can be any valid React node
	onRefresh: () => Promise<void> // onRefresh should be a function that returns a Promise
} & ScrollViewProps // Allows passing additional props supported by ScrollView

export const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
	children,
	onRefresh,
	...scrollViewProps // Allows passing extra ScrollView props
}) => {
	const [refreshing, setRefreshing] = useState(false)

	const handleRefresh = async () => {
		setRefreshing(true)
		await onRefresh() // Call the provided onRefresh function
		setRefreshing(false)
	}

	return (
		<ScrollView
			{...scrollViewProps} // Spread additional props into ScrollView
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={handleRefresh}
					colors={["#1E90FF"]} // Customize the spinner color (optional)
				/>
			}
		>
			{children}
		</ScrollView>
	)
}
