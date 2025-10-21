import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui"
import { usePathname } from "expo-router"
import React, { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { Entypo, FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function TabLayout() {
	const pathname = usePathname()
	const scaleAnim = useRef(new Animated.Value(1)).current
	const previousPath = useRef(pathname)
	const router = useRouter()
	const isNavigatingRef = useRef(false) // 👈 prevents double tap
	type BasePath = "/doctors" | "/appointments" | "/home" | "/profile"

	// Function to get the base path (e.g., "/profile/settings" -> "/profile")
	const getBasePath = (path: string) => "/" + path.split("/")[1]
	// Function to check if the current tab is active
	const isActive = (href: string) => pathname.startsWith(href)

	useEffect(() => {
		const prevBasePath = getBasePath(previousPath.current)
		const currentBasePath = getBasePath(pathname)

		// Only animate if switching between different main paths
		if (prevBasePath !== currentBasePath) {
			Animated.spring(scaleAnim, {
				toValue: 1.2, // Slightly enlarges the icon
				useNativeDriver: true,
			}).start(() => {
				Animated.spring(scaleAnim, {
					toValue: 1, // Returns to normal size
					useNativeDriver: true,
				}).start()
			})
		}

		// Update the previous path reference
		previousPath.current = pathname
	}, [pathname])

	const handleTabPress = (href: BasePath) => {
		if (isNavigatingRef.current) return

		const isNested = pathname.startsWith(href) && pathname !== href

		isNavigatingRef.current = true

		if (isNested) {
			router.replace(href)
		} else if (pathname !== href) {
			router.push(href)
		}

		// Reset navigating flag after small delay to avoid blocking next taps
		setTimeout(() => {
			isNavigatingRef.current = false
		}, 150)
	}

	return (
		<Tabs>
			<TabSlot />

			<TabList style={styles.tabBar}>
				<TabTrigger
					onPress={() => handleTabPress("/home")}
					name="home"
					href="/home"
					style={styles.tabItem}
				>
					<View
						style={[styles.tabButton, isActive("/home") && styles.activeTab]}
					>
						<Animated.View
							style={{
								transform: [{ scale: isActive("/home") ? scaleAnim : 1 }],
							}}
						>
							<Entypo
								name="home"
								size={24}
								color={isActive("/home") ? "#007bff" : "black"}
							/>
						</Animated.View>
						<Text
							style={[styles.tabText, isActive("/home") && styles.activeText]}
						>
							Home
						</Text>
					</View>
				</TabTrigger>

				<TabTrigger
					onPress={() => handleTabPress("/doctors")}
					name="doctors"
					href="/doctors"
					style={styles.tabItem}
				>
					<View
						style={[styles.tabButton, isActive("/doctors") && styles.activeTab]}
					>
						<Animated.View
							style={{
								transform: [{ scale: isActive("/doctors") ? scaleAnim : 1 }],
							}}
						>
							<FontAwesome6
								name="user-doctor"
								size={24}
								color={isActive("/doctors") ? "#007bff" : "black"}
							/>
						</Animated.View>
						<Text
							style={[
								styles.tabText,
								isActive("/doctors") && styles.activeText,
							]}
						>
							Doctors
						</Text>
					</View>
				</TabTrigger>

				<TabTrigger
					onPress={() => handleTabPress("/appointments")}
					name="appointments"
					href="/appointments"
					style={styles.tabItem}
				>
					<View
						style={[
							styles.tabButton,
							isActive("/appointments") && styles.activeTab,
						]}
					>
						<Animated.View
							style={{
								transform: [
									{ scale: isActive("/appointments") ? scaleAnim : 1 },
								],
							}}
						>
							<FontAwesome5
								name="calendar"
								size={24}
								color={isActive("/appointments") ? "#007bff" : "black"}
							/>
						</Animated.View>
						<Text
							style={[
								styles.tabText,
								isActive("/appointments") && styles.activeText,
							]}
						>
							Appointments
						</Text>
					</View>
				</TabTrigger>

				<TabTrigger
					onPress={() => handleTabPress("/profile")}
					name="profile"
					href="/profile"
					style={styles.tabItem}
				>
					<View
						style={[styles.tabButton, isActive("/profile") && styles.activeTab]}
					>
						<Animated.View
							style={{
								transform: [{ scale: isActive("/profile") ? scaleAnim : 1 }],
							}}
						>
							<FontAwesome5
								name="user"
								size={24}
								color={isActive("/profile") ? "#007bff" : "black"}
							/>
						</Animated.View>
						<Text
							style={[
								styles.tabText,
								isActive("/profile") && styles.activeText,
							]}
						>
							Profile
						</Text>
					</View>
				</TabTrigger>
			</TabList>
		</Tabs>
	)
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "#fff",
		paddingVertical: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
		alignItems: "center",
	},

	tabItem: {
		flex: 1,
		alignItems: "center",
	},

	tabButton: {
		alignItems: "center",
		paddingVertical: 8,
	},

	tabText: {
		fontSize: 12,
		fontWeight: "500",
		marginTop: 4,
		color: "black",
	},

	// Active Tab Styles
	activeTab: {
		borderTopWidth: 2,
		borderTopColor: "#007bff",
	},

	activeText: {
		color: "#007bff",
		fontWeight: "bold",
	},
})
