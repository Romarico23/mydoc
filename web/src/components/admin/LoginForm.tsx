"use client"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { LoginFormData } from "@/types/types"

export default function LoginForm() {
	const { toast } = useToast()
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const form = useForm<LoginFormData>({
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onSubmit = async (data: LoginFormData) => {
		setLoading(true)
		const result = await signIn("credentials", {
			email: data.email,
			password: data.password,
			role: "admin",
			// role,
			redirect: false, // Do not redirect immediately
		})

		if (result?.error) {
			toast({
				title: "Login Failed",
				description: "Invalid email or password",
				variant: "destructive",
			})
		} else {
			toast({
				title: "Login Successful!",
				description: `Welcome, ${data.email}`,
			})

			// Redirect to dashboard or desired page
			router.push("/admin/dashboard")
		}
		setLoading(false)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-1 gap-4">
					{/* Email */}
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="Your email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Password */}
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button disabled={loading} type="submit" className="mt-4 w-full">
					{loading ? "Loading..." : "Login"}
				</Button>
			</form>
		</Form>
	)
}
