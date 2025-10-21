import React from "react"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

type DashboardCardProps = {
	count: string
	description: string
	icon: React.ReactElement<LucideIcon>
}

function DashboardCard({ icon, count, description }: DashboardCardProps) {
	return (
		<Card className="md:flex items-center justify-center">
			<CardHeader className="flex flex-row items-center gap-2">
				{icon}
				<div>
					<CardTitle>{count}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</div>
			</CardHeader>
		</Card>
	)
}

export default DashboardCard
