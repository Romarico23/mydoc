import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import "react-native-reanimated"

import { useColorScheme } from "@/hooks/useColorScheme"
import TanstackProvider from "@/lib/providers/TanstackProvider"
import AuthProvider from "@/lib/providers/AuthProvider"
import { StripeProvider } from "@stripe/stripe-react-native"
import { StatusBar } from "expo-status-bar"
import { View } from "react-native"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	})

	useEffect(() => {
		if (loaded) {
			try {
				SplashScreen.hideAsync()
			} catch (error) {
				console.error("Failed to hide splash screen:", error)
			}
		}
	}, [loaded])

	if (!loaded) {
		return null
	}

	return (
		<AuthProvider>
			<TanstackProvider>
				<StripeProvider
					publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
				>
					<StatusBar
						translucent={false}
						backgroundColor="transparent"
						style={"dark"}
					/>

					<Stack>
						<Stack.Screen name="(auth)" options={{ headerShown: false }} />
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="+not-found" />
					</Stack>
				</StripeProvider>
			</TanstackProvider>
		</AuthProvider>
	)
}
