export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export const todayString = (): string => formatDate(new Date())

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

export const getDaysInMonth = (date: Date): number => {
  const year = date.getFullYear()
  const month = date.getMonth()
  return new Date(year, month + 1, 0).getDate()
}

export const getCalendarDays = (date: Date): Date[] => {
  const start = startOfMonth(date)
  const startWeekday = start.getDay()
  const totalDays = getDaysInMonth(date)
  const days: Date[] = []

  for (let i = 0; i < startWeekday; i += 1) {
    days.push(addDays(start, i - startWeekday))
  }

  for (let i = 0; i < totalDays; i += 1) {
    days.push(addDays(start, i))
  }

  while (days.length % 7 !== 0) {
    days.push(addDays(days[days.length - 1], 1))
  }

  return days
}

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const lastNDays = (count: number, endDate: Date = new Date()): Date[] => {
  const days: Date[] = []
  for (let i = count - 1; i >= 0; i -= 1) {
    days.push(addDays(endDate, -i))
  }
  return days
}

export const isToday = (date: Date): boolean => isSameDay(date, new Date())
