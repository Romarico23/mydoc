import Navbar from "@/components/doctor/layout/Navbar"
import Sidebar from "@/components/doctor/layout/Sidebar"
import ClientSessionWrapper from "@/components/doctor/layout/ClientSessionWrapper"
import { Toaster } from "@/components/ui/toaster"
import React from "react"

export default function DoctorLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<ClientSessionWrapper>
				<div className="min-h-screen flex">
					<Sidebar />
					<div className="flex-1">
						<Navbar />
						<main className="flex-grow p-4">{children}</main>
					</div>
				</div>
				<Toaster />
			</ClientSessionWrapper>
		</>
	)
}
