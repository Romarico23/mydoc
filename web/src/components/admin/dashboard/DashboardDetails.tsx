"use client"

import React from "react"
import DashboardCard from "@/components/common/dashboard/DashboardCard"
import {
	CalendarCheck2,
	CheckCircle,
	CircleX,
	HeartPulse,
	Notebook,
	Stethoscope,
	TrendingUp,
} from "lucide-react"
import {
	appointmentCancel,
	appointmentComplete,
	viewAdminDashboard,
} from "@/lib/services/adminApi"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import LoadingComponent from "../../ui/loadingComponent"
import { AppointmentListProps, DashboardData } from "@/types/types"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	Label,
	Pie,
	PieChart,
} from "recharts"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { ScrollBar } from "../../ui/scroll-area"

function DashboardDetails() {
	const axiosAuth = useAxiosAuth()
	const queryClient = useQueryClient()
	const { toast } = useToast()

	const {
		data: viewDashboard,
		isLoading: viewDashboardIsLoading,
		isError: viewDashboardIsError,
	} = useQuery({
		queryFn: () => viewAdminDashboard(axiosAuth),
		queryKey: ["adminDashboard"],
	})

	const cancelMutation = useMutation({
		mutationFn: (appointmentId: string) =>
			appointmentCancel(appointmentId, axiosAuth),
		onSuccess: (data) => {
			toast({
				title: data.title,
				description: data.message,
			})
			queryClient.invalidateQueries({
				queryKey: ["adminDashboard"],
			})
		},
		onError: (error: any) => {
			toast({
				title: "Cancellation Failed",
				description:
					error?.response?.data?.message ||
					"Something went wrong. Please try again.",
			})
		},
	})

	const completeMutation = useMutation({
		mutationFn: (appointmentId: string) =>
			appointmentComplete(appointmentId, axiosAuth),
		onSuccess: (data) => {
			toast({
				title: data.title,
				description: data.message,
			})
			queryClient.invalidateQueries({
				queryKey: ["adminDashboard"],
			})
		},
		onError: (error: any) => {
			toast({
				title: "Completion Failed",
				description:
					error?.response?.data?.message ||
					"Something went wrong. Please try again.",
			})
		},
	})

	if (viewDashboardIsLoading) return <LoadingComponent />
	if (viewDashboardIsError) return <div>Error loading dashboard.</div>

	const firstAndLastMonths = viewDashboard?.dashboardData?.monthlyStats?.length
		? `${viewDashboard.dashboardData.monthlyStats[0].month} - ${
				viewDashboard.dashboardData.monthlyStats[
					viewDashboard.dashboardData.monthlyStats.length - 1
				].month
		  } ${viewDashboard.dashboardData.monthlyStats[0].year}`
		: "No Data"

	const appointmentStats = viewDashboard?.dashboardData?.appointmentStats || {
		cancelled: 0,
		completed: 0,
		pending: 0,
	}

	// Format data for the chart
	const appointmentChartData = [
		{
			status: "cancelled",
			count: appointmentStats.cancelled,
			fill: "var(--color-cancelled)",
		},
		{
			status: "completed",
			count: appointmentStats.completed,
			fill: "var(--color-completed)",
		},
		{
			status: "pending",
			count: appointmentStats.pending,
			fill: "var(--color-pending)",
		},
	]

	// Extract the data for the chart from viewDashboard
	const monthlyChartData = viewDashboard?.dashboardData.monthlyStats.map(
		(monthData: any) => ({
			month: monthData.month,
			doctors: monthData.doctors,
			patients: monthData.patients,
		})
	)

	const appointmentChartConfig = {
		appointments: {
			label: "Appointments",
		},
		cancelled: {
			label: "Cancelled",
			color: "hsl(var(--chart-1))",
		},
		completed: {
			label: "Completed",
			color: "hsl(var(--chart-2))",
		},
		pending: {
			label: "Pending",
			color: "hsl(var(--chart-5))",
		},
	} satisfies ChartConfig

	const monthlyChartConfig = {
		doctors: {
			label: "Doctors",
			color: "hsl(var(--chart-1))",
		},
		patients: {
			label: "Patients",
			color: "hsl(var(--chart-2))",
		},
	} satisfies ChartConfig

	console.log(viewDashboard)


	return (
		<div className="grid grid-cols-1 gap-5">
			<div className="flex flex-col md:flex-row justify-center gap-5">
				<Card>
					<CardHeader>
						<CardTitle>Bar Chart - Doctors & Patients</CardTitle>
						<CardDescription>{firstAndLastMonths}</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={monthlyChartConfig}>
							<BarChart accessibilityLayer data={monthlyChartData}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent indicator="dashed" />}
								/>
								<Bar dataKey="doctors" fill="var(--color-doctors)" radius={4} />
								<Bar
									dataKey="patients"
									fill="var(--color-patients)"
									radius={4}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
					<CardFooter className="flex flex-col items-center text-sm">
						<div className="leading-none text-muted-foreground">
							Total number of doctors and patients over the past 6 months
						</div>
					</CardFooter>
				</Card>
				<Card className="flex flex-col">
					<CardHeader className="items-center pb-0">
						<CardTitle>Pie Chart - Appointment Status</CardTitle>
						<CardDescription>
							{new Date().toLocaleDateString("default", {
								month: "long",
								year: "numeric",
							})}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex-1 pb-0">
						<ChartContainer
							config={appointmentChartConfig}
							className="mx-auto aspect-square max-h-[220px]"
						>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Pie
									data={appointmentChartData}
									dataKey="count"
									nameKey="status"
									innerRadius={60}
									strokeWidth={5}
								>
									<Label
										content={({ viewBox }) => {
											if (viewBox && "cx" in viewBox && "cy" in viewBox) {
												return (
													<text
														x={viewBox.cx}
														y={viewBox.cy}
														textAnchor="middle"
														dominantBaseline="middle"
													>
														<tspan
															x={viewBox.cx}
															y={viewBox.cy}
															className="fill-foreground text-3xl font-bold"
														>
															{viewDashboard?.dashboardData.monthlyAppointments}
														</tspan>
														<tspan
															x={viewBox.cx}
															y={(viewBox.cy || 0) + 24}
															className="fill-muted-foreground"
														>
															Appointments
														</tspan>
													</text>
												)
											}
										}}
									/>
								</Pie>
							</PieChart>
						</ChartContainer>
					</CardContent>
					<CardFooter className="flex flex-col items-center text-center text-sm">
						<div className="leading-none text-muted-foreground">
							Total appointments for the current month
						</div>
					</CardFooter>
				</Card>
			</div>
			<div className="grid md:grid-cols-3 gap-3">
				<DashboardCard
					icon={<Stethoscope size={40} className="text-cyan-500" />}
					count={viewDashboard?.dashboardData.totalDoctors}
					description="Total Doctors (Yearly)"
				/>
				<DashboardCard
					icon={<CalendarCheck2 size={40} className="text-cyan-500" />}
					count={viewDashboard?.dashboardData.totalAppointments}
					description="Total Appointments (Yearly)"
				/>
				<DashboardCard
					icon={<HeartPulse size={40} className="text-cyan-500" />}
					count={viewDashboard?.dashboardData.totalPatients}
					description="Total Patients (Yearly)"
				/>
			</div>

			<ScrollArea className="w-full whitespace-nowrap border border-gray-300 rounded-lg">
				<Table>
					<TableHeader>
						<TableRow className="pointer-events-none">
							<TableHead className="text-2xl font-semibold flex items-center gap-2 py-10">
								<Notebook size={30} />
								Latest Appointments
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{viewDashboard?.dashboardData.latestAppointments.map(
							(appointment: AppointmentListProps) => (
								<TableRow key={appointment._id} className="border-none">
									<TableCell className="flex gap-4">
										{appointment.docData.image && (
											<Link
												href={`/admin/appointments/${appointment._id}`}
												className="flex items-center"
											>
												<div className="w-10 h-10 rounded-full overflow-hidden">
													<img
														src={appointment.docData.image}
														alt={appointment.docData.name}
														className="w-full h-full object-cover"
													/>
												</div>
											</Link>
										)}
										<Link
											href={`/admin/appointments/${appointment._id}`}
											className=" hover:text-blue-500"
										>
											<h6 className="font-semibold">
												{appointment.docData.name}
											</h6>
											<p>
												Booking on {formatDate(new Date(appointment.slotDate))}
											</p>
										</Link>
									</TableCell>
									<TableCell>
										<div className="flex justify-center items-center">
											{appointment.cancelled ? (
												<p className="text-red-500">Cancelled</p>
											) : appointment.isCompleted ? (
												<p className="text-green-500">Completed</p>
											) : (
												<>
													<button
														onClick={() =>
															cancelMutation.mutate(appointment._id)
														}
														className="text-red-500 hover:text-red-300"
													>
														<CircleX />
													</button>
													<button
														onClick={() =>
															completeMutation.mutate(appointment._id)
														}
														className="text-green-500 hover:text-green-300 ml-2"
													>
														<CheckCircle />
													</button>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							)
						)}
					</TableBody>
				</Table>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	)
}

export default DashboardDetails
