"use client"

import React, { useState, useEffect, useRef } from "react"
import {
	CalendarCheck2,
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
import { searchUsers } from "@/lib/services/doctorApi"
import { useQuery } from "@tanstack/react-query"
import { UserFormData } from "@/types/types"
import useAxiosAuth from "@/hooks/useAxiosAuth"

function Sidebar() {
	const [isOpen, setIsOpen] = useState(false)
	const sidebarRef = useRef<HTMLDivElement | null>(null) // Typed as HTMLDivElement or null
	const pathname = usePathname()
	const axiosAuth = useAxiosAuth()
	const [query, setQuery] = useState("")

	const {
		data: viewSearch,
		isLoading: searchIsLoading,
		isError: searchIsError,
	} = useQuery({
		queryFn: () => searchUsers(query, axiosAuth),
		queryKey: ["search", query],
		enabled: !!query,
	})

	const toggleSidebar = () => {
		setIsOpen(!isOpen)
	}

	const handleChange = (event: any) => {
		setQuery(event.target.value)
	}

	// Close sidebar when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				sidebarRef.current &&
				!sidebarRef.current.contains(event.target as Node)
			) {
				setIsOpen(false) // Close sidebar if clicked outside
			}
		}
		// Add event listener for clicks
		document.addEventListener("mousedown", handleClickOutside)
		// Clean up the event listener
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [sidebarRef])

	return (
		<div className="relative">
			{/* Toggle Button */}
			<Button
				className={`lg:hidden fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-500 p-2 rounded-full text-white z-50 transition-all duration-300 ${
					isOpen ? "ml-52 z-50" : "left-[-20px]"
				}`}
				onClick={toggleSidebar}
			>
				<PanelRight />
			</Button>

			{/* Sidebar */}
			<div
				ref={sidebarRef} // Attach ref to the sidebar
				className={`fixed lg:static z-40 left-0 w-56 h-full bg-white shadow-lg transform duration-300 ease-in-out 
				${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
			>
				<div className="flex flex-col h-full">
					<Command className="bg-secondary rounded-none p-4">
						<div
							className="flex items-center border-b px-2"
							cmdk-input-wrapper=""
						>
							<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
							<input
								className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
								value={query}
								onChange={handleChange}
								placeholder="Search users..."
							/>
						</div>
						<CommandList>
							{!!query ? (
								<>
									{searchIsLoading && <CommandEmpty>Loading...</CommandEmpty>}
									{searchIsError && (
										<CommandEmpty>
											Error fetching data. Please try again later.
										</CommandEmpty>
									)}
									{!searchIsLoading &&
										!searchIsError &&
										(viewSearch?.users.length === 0 ? (
											<CommandEmpty>No results found.</CommandEmpty>
										) : (
											<CommandGroup>
												{viewSearch?.users.map((user: UserFormData) => (
													<CommandItem key={user._id}>
														<Link
															href={`/doctor/patients/${user._id}`} // Updated link path
															onClick={() => setIsOpen(false)}
															className="flex items-center gap-2 hover:text-blue-500"
														>
															<div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
																{user.image !== null ? (
																	<img
																		src={user.image}
																		alt={user.name}
																		className="w-full h-full object-cover"
																	/>
																) : (
																	<UserRound />
																)}
															</div>
															{user.name}
														</Link>
													</CommandItem>
												))}
											</CommandGroup>
										))}
								</>
							) : (
								<CommandGroup>
									<CommandItem>
										<Link
											className={`flex items-center gap-2 ${
												pathname.startsWith("/doctor/dashboard") &&
												"text-cyan-500"
											}`}
											href="/doctor/dashboard"
											onClick={() => setIsOpen(false)}
										>
											<LayoutDashboard />
											Dashboard
										</Link>
									</CommandItem>
									<CommandItem>
										<Link
											href="/doctor/appointments"
											className={`flex items-center gap-2 ${
												pathname.startsWith("/doctor/appointments") &&
												"text-cyan-500"
											}`}
											onClick={() => setIsOpen(false)}
										>
											<CalendarCheck2 />
											Appointments
										</Link>
									</CommandItem>
									<CommandItem>
										<Link
											href="/doctor/patients"
											className={`flex items-center gap-2 ${
												pathname.startsWith("/doctor/patients") &&
												"text-cyan-500"
											}`}
											onClick={() => setIsOpen(false)}
										>
											<Stethoscope />
											Patients
										</Link>
									</CommandItem>
									<CommandItem>
										<Link
											href="/doctor/profile"
											className={`flex items-center gap-2 ${
												pathname.startsWith("/doctor/profile") &&
												"text-cyan-500"
											}`}
											onClick={() => setIsOpen(false)}
										>
											<UserRound />
											Profile
										</Link>
									</CommandItem>
								</CommandGroup>
							)}
						</CommandList>
					</Command>
				</div>
			</div>
		</div>
	)
}

export default Sidebar
