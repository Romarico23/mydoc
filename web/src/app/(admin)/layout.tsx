// import ClientSessionWrapper from "@/components/admin/layout/ClientSessionWrapper"
// import Navbar from "@/components/admin/layout/Navbar"
// import Sidebar from "@/components/admin/layout/Sidebar"
// import { Toaster } from "@/components/ui/toaster"
// import React from "react"

// export default function AdminLayout({
// 	children,
// }: {
// 	children: React.ReactNode
// }) {
// 	return (
// 		<>
// 			<ClientSessionWrapper>
// 				<div>
// 					<Navbar />
// 					<div className="flex">
// 						<Sidebar />
// 						{/* <div className="p-5 w-full md:max-w-[1140px]">{children}</div> */}
// 						<div className="p-5 w-full">{children}</div>
// 					</div>
// 					<Toaster />
// 				</div>
// 			</ClientSessionWrapper>
// 		</>
// 	)
// }

import ClientSessionWrapper from "@/components/admin/layout/ClientSessionWrapper"
import Navbar from "@/components/admin/layout/Navbar"
import Sidebar from "@/components/admin/layout/Sidebar"
import { Toaster } from "@/components/ui/toaster"
import React from "react"

export default function AdminLayout({
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
						{/* <div className="p-5 w-full md:max-w-[1140px]">{children}</div> */}
						<main className="flex-grow p-4">{children}</main>
					</div>
				</div>
				<Toaster />
			</ClientSessionWrapper>
		</>
	)
}
