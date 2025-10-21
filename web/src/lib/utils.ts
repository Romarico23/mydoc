import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// Utility function to calculate age
export const calculateAge = (birthDate: string): number => {
	const today = new Date()
	const birth = new Date(birthDate)

	let age = today.getFullYear() - birth.getFullYear()
	const monthDifference = today.getMonth() - birth.getMonth()

	// Adjust age if the birthday hasn't occurred yet this year
	if (
		monthDifference < 0 ||
		(monthDifference === 0 && today.getDate() < birth.getDate())
	) {
		age--
	}

	return age
}

export const formatDate = (date: Date) =>
	date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	})
