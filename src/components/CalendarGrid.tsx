import { Entry } from '../lib/types'
import { formatDate, getCalendarDays, isSameDay } from '../lib/dates'

type CalendarGridProps = {
  month: Date
  entries: Entry[]
  selectedDate: Date
  onSelect: (date: Date) => void
}

const CalendarGrid = ({ month, entries, selectedDate, onSelect }: CalendarGridProps) => {
  const entryMap = new Map(entries.map((entry) => [entry.date, entry]))
  const days = getCalendarDays(month)
  const monthIndex = month.getMonth()
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="calendar">
      <div className="calendar-weekdays">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((day) => {
          const dateKey = formatDate(day)
          const entry = entryMap.get(dateKey)
          const isCurrentMonth = day.getMonth() === monthIndex
          const isSelected = isSameDay(day, selectedDate)
          return (
            <button
              key={dateKey}
              type="button"
              className={`calendar-cell ${isCurrentMonth ? '' : 'faded'} ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() => onSelect(day)}
            >
              <span className="calendar-date">{day.getDate()}</span>
              {entry && <span className={`calendar-dot ${entry.status}`} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
