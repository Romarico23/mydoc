// export const formatDate = (date: Date) =>
// 	date.toLocaleDateString("en-US", {
// 		weekday: "short",
// 		month: "short",
// 		day: "numeric",
// 		year: "numeric",
// 	})

export const formatDate = (dateString: string) => {
	const date = new Date(dateString)
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

export const formatTime = (date: Date) =>
	date.toLocaleDateString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	})

// Generate all dates for the current month, starting from today
export const getMonthDates = (month: Date) => {
	const year = month.getFullYear()
	const monthIndex = month.getMonth()
	const totalDays = new Date(year, monthIndex + 1, 0).getDate() // Get the number of days in the month

	const today = new Date()
	// today.setHours(0, 0, 0, 0) // Set today's time to midnight to avoid time comparison issues
	const filteredDates: Date[] = []

	// Start from the current date and include future dates
	for (let i = 1; i <= totalDays; i++) {
		const date = new Date(year, monthIndex, i)
		// Only include dates that are today or in the future
		if (date >= today) {
			filteredDates.push(date)
		}
	}

	return filteredDates
}

// Generate 30-minute time slots in AM/PM format
export const generateTimeSlots = () => {
	const slots: string[] = []
	for (let hour = 9; hour < 17; hour++) {
		const period = hour >= 12 ? "PM" : "AM"
		const standardHour = hour > 12 ? hour - 12 : hour
		slots.push(`${standardHour}:00 ${period}`, `${standardHour}:30 ${period}`)
	}
	return slots
}

export const convertTo24HourFormat = (time: string): string => {
	const [timePart, period] = time.split(" ")
	let [hour, minute] = timePart.split(":").map(Number)

	if (period === "PM" && hour !== 12) {
		hour += 12
	} else if (period === "AM" && hour === 12) {
		hour = 0
	}

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

// export const convertToAmPmFormat = (time: string): string => {
// 	const [hour, minute] = time.split(":").map(Number)

// 	let period = "AM"
// 	let standardHour = hour

// 	if (hour >= 12) {
// 		period = "PM"
// 		if (hour > 12) {
// 			standardHour = hour - 12
// 		}
// 	} else if (hour === 0) {
// 		standardHour = 12 // Handle midnight (0:00)
// 	}

// 	return `${standardHour}:${String(minute).padStart(2, "0")} ${period}`
// }

export const convertToAmPmFormat = (timeString: string) => {
	const [hour, minute] = timeString.split(":")
	const period = parseInt(hour) >= 12 ? "PM" : "AM"
	const standardHour = parseInt(hour) % 12 || 12
	return `${standardHour}:${minute} ${period}`
}
