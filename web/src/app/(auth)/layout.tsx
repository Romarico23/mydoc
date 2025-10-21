import SessionRedirectWrapper from "@/components/common/layout/SessionRedirectWrapper"
import { Toaster } from "@/components/ui/toaster"
import React from "react"

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<SessionRedirectWrapper>
				<div>{children}</div>
				<Toaster />
			</SessionRedirectWrapper>
		</>
	)
}
