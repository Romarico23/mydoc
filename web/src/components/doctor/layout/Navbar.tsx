"use client"

import React, { useState } from "react"
import mydoclogo from "../../../assets/mydoc_logo.png"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DoctorProfileData, NotificationData } from "@/types/types"
import {
	markNotificationAsRead,
	viewDoctorNotificationList,
	viewDoctorProfile,
} from "@/lib/services/doctorApi"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

function Navbar() {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewProfile,
		isLoading: viewProfileIsLoading,
		isError: viewProfileIsError,
	} = useQuery<DoctorProfileData>({
		queryFn: () => viewDoctorProfile(axiosAuth),
		queryKey: ["doctorProfile"],
	})

	const {
		data: viewNotification,
		isLoading: viewNotificationIsLoading,
		isError: viewNotificationIsError,
	} = useQuery({
		queryFn: () => viewDoctorNotificationList(axiosAuth),
		queryKey: ["notificationList"],
	})

	const markAsReadMutation = useMutation({
		mutationFn: (notificationId: string) =>
			markNotificationAsRead(notificationId, axiosAuth),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["notificationList"],
			})
		},
		onError: (error: any) => {
			toast({
				title: "Notifaction Failed",
				description:
					error?.response?.data?.message ||
					"Something went wrong. Please try again.",
			})
		},
	})

	const handleLogout = async () => {
		setLoading(true)
		await signOut({
			redirect: true,
			callbackUrl: "/doctor/login",
		})
		setLoading(false)
	}

	// Calculate the number of unread notifications
	const unreadNotificationsCount =
		viewNotification?.notifications?.filter(
			(notification: NotificationData) => !notification.read
		).length || 0

	return (
		<div className="bg-primary-foreground dark:bg-slate-700 py-2 px-5 flex justify-between items-center shadow-md">
			<Link href="/">
				<Image src={mydoclogo} alt="MyDoc" width={60} />
			</Link>

			<div className="flex items-center gap-4">
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger className="focus:outline-none relative flex">
						<Bell className="text-3xl text-gray-600 hover:text-blue-300 ease-in-out duration-300" />
						{unreadNotificationsCount > 0 && (
							<span className="absolute flex items-center justify-center left-[1rem] bottom-[1rem] h-5 w-5 bg-red-500 text-white rounded-full text-xs font-semibold">
								{unreadNotificationsCount}
							</span>
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent className="max-h-96 overflow-y-auto">
						<DropdownMenuLabel>Notifications</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{viewNotificationIsLoading ? (
							<DropdownMenuItem>Loading notifications...</DropdownMenuItem>
						) : viewNotificationIsError ? (
							<DropdownMenuItem>Error loading notifications.</DropdownMenuItem>
						) : viewNotification?.notifications?.length === 0 ? (
							<DropdownMenuItem>No notifications found.</DropdownMenuItem>
						) : (
							viewNotification?.notifications?.map(
								(notification: NotificationData) => (
									<DropdownMenuItem
										key={notification._id}
										className={`flex flex-col items-start gap-1 hover:cursor-pointer
											${
												notification.read
													? "bg-gray-100 text-gray-500" // Styles for read notifications
													: "bg-red-100 text-red-900" // Styles for unread notifications
											} `}
										onClick={() =>
											router.push(
												`/doctor/appointments/${notification.appointmentId}`
											)
										}
									>
										<p className="font-semibold">{notification.message}</p>
										<p>
											{notification.metadata &&
												formatDate(
													new Date(notification?.metadata?.slotDate)
												)}{" "}
											at {notification.metadata?.slotTime}
										</p>
									</DropdownMenuItem>
								)
							)
						)}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu modal={false}>
					<DropdownMenuTrigger className="focus:outline-none">
						<Avatar>
							<AvatarImage
								src={viewProfile?.doctor.image}
								alt={viewProfile?.doctor.name}
							/>
							<AvatarFallback className="text-black">
								{viewProfile?.doctor.name}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="hover:cursor-pointer"
							onClick={() => router.push("/doctor/profile")}
						>
							<p>Profile</p>
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={loading}
							className="hover:cursor-pointer"
							onClick={handleLogout}
						>
							{loading ? "Loading..." : "Logout"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}

export default Navbar
