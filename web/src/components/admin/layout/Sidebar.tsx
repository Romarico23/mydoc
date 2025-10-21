"use client"

import React, { useState, useRef, useEffect } from "react"
import {
	Activity,
	CalendarCheck2,
	Hospital,
	LayoutDashboard,
	PanelRight,
	Search,
	Stethoscope,
	UserRound,
} from "lucide-react"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import Link from "next/link"
import { Button } from "../../ui/button"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import useAxiosAuth from "@/hooks/useAxiosAuth"
import { searchProfiles } from "@/lib/services/adminApi"
import { DoctorListProps, UserFormData } from "@/types/types"

const menuItems = [
	{ href: "/admin/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
	{
		href: "/admin/appointments",
		icon: <CalendarCheck2 />,
		label: "Appointments",
	},
	{ href: "/admin/doctors", icon: <Hospital />, label: "Doctors" },
	{ href: "/admin/patients", icon: <UserRound />, label: "Patients" },
	{ href: "/admin/add-doctor", icon: <Stethoscope />, label: "Add Doctor" },
	{
		href: "/admin/add-speciality",
		icon: <Activity />,
		label: "Add Speciality",
	},
]

function Sidebar() {
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState("")
	const sidebarRef = useRef<HTMLDivElement>(null)
	const pathname = usePathname()
	const axiosAuth = useAxiosAuth()

	const {
		data: viewSearch,
		isLoading,
		isError,
	} = useQuery({
		queryFn: () => searchProfiles(query, axiosAuth),
		queryKey: ["search", query],
		enabled: !!query,
	})

	const toggleSidebar = () => setIsOpen(!isOpen)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	return (
		<div className="relative">
			<Button
				className={`lg:hidden fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-500 p-2 rounded-full text-white z-50 transition-all duration-300 ${
					isOpen ? "ml-52 z-50" : "left-[-20px]"
				}`}
				onClick={toggleSidebar}
			>
				<PanelRight />
			</Button>

			<div
				ref={sidebarRef}
				className={`fixed lg:static z-40 left-0 w-56 h-full bg-white shadow-lg transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} lg:translate-x-0`}
			>
				<Command className="bg-secondary rounded-none p-4">
					<div className="flex items-center border-b px-2">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						<input
							className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search doctors/users..."
						/>
					</div>
					<CommandList>
						{query ? (
							<>
								{isLoading && <CommandEmpty>Loading...</CommandEmpty>}
								{isError && (
									<CommandEmpty>
										Error fetching data. Please try again later.
									</CommandEmpty>
								)}
								{!isLoading && !isError && (
									<CommandGroup>
										{viewSearch?.results?.doctors.map(
											(doctor: DoctorListProps) => (
												<CommandItem key={doctor._id}>
													<Link
														href={`/admin/doctors/${doctor._id}`}
														onClick={() => setIsOpen(false)}
														className="flex items-center hover:text-blue-500"
													>
														{doctor.image ? (
															<img
																src={doctor.image}
																alt={doctor.name}
																className="w-10 h-10 pr-2 rounded-full object-cover"
															/>
														) : (
															<UserRound />
														)}
														{doctor.name}
													</Link>
												</CommandItem>
											)
										)}
										{viewSearch?.results?.users.map((user: UserFormData) => (
											<CommandItem key={user._id}>
												<Link
													href={`/admin/patients/${user._id}`}
													onClick={() => setIsOpen(false)}
													className="flex items-center gap-2 hover:text-blue-500"
												>
													{user.image ? (
														<img
															src={user.image}
															alt={user.name}
															className="w-8 h-8 rounded-full object-cover"
														/>
													) : (
														<UserRound />
													)}
													{user.name}
												</Link>
											</CommandItem>
										))}
									</CommandGroup>
								)}
							</>
						) : (
							<CommandGroup>
								{menuItems.map((item) => (
									<CommandItem key={item.href}>
										<Link
											href={item.href}
											className={`flex items-center gap-2 ${
												pathname.startsWith(item.href) && "text-cyan-500"
											}`}
											onClick={() => setIsOpen(false)}
										>
											{item.icon}
											{item.label}
										</Link>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</div>
		</div>
	)
}

export default Sidebar
