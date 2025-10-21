import { useState } from "react"
import { useStripe } from "@stripe/stripe-react-native"
import { Alert } from "react-native"
import { AppointmentPaymentData } from "@/lib/types/types"

export type RatingModalProps = {
	handlePaymentMutation: any
	verifyStripepayMutation: any
}

export const useStripePayment = ({
	handlePaymentMutation,
	verifyStripepayMutation,
}: RatingModalProps) => {
	const { initPaymentSheet, presentPaymentSheet } = useStripe()
	const [loading, setLoading] = useState(false)

	const handleStripePayment = async (
		appointmentPaymentData: AppointmentPaymentData
	) => {
		setLoading(true)
		try {
			const { clientSecret, ephemeralKey, customer } =
				await handlePaymentMutation.mutateAsync(appointmentPaymentData)

			const { error } = await initPaymentSheet({
				merchantDisplayName: "MyDoc",
				paymentIntentClientSecret: clientSecret,
				customerEphemeralKeySecret: ephemeralKey,
				customerId: customer,
			})

			if (error) {
				Alert.alert("Stripe Error", error.message || "Something went wrong.")
				return
			}

			const { error: paymentError } = await presentPaymentSheet()
			if (paymentError) {
				Alert.alert("Payment Failed", paymentError.message || "Payment failed.")
			} else {
				await verifyStripepayMutation.mutateAsync(
					appointmentPaymentData.appointmentId
				)
				Alert.alert("Payment Success", "Your payment was successful.")
			}
		} catch (error: any) {
			console.error("Error processing payment:", error)
			Alert.alert(
				"Payment Failed",
				"There was an error processing the payment."
			)
		} finally {
			setLoading(false)
		}
	}

	return { handleStripePayment, loading }
}
