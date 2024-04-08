export function addMinutesToDate(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60000)
}

export function toTimestamp(date: string): number {
	return Math.floor(new Date(date).getTime() / 1000)
}
