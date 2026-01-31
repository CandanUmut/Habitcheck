export type NoteEntry = {
  text: string
  createdAt: number
}

const isNoteEntry = (value: unknown): value is NoteEntry => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as NoteEntry
  return typeof candidate.text === 'string' && typeof candidate.createdAt === 'number'
}

const normalizeNotes = (notes: NoteEntry[]): NoteEntry[] =>
  notes
    .filter((note) => note.text.trim())
    .map((note) => ({
      text: note.text.trim(),
      createdAt: Number.isFinite(note.createdAt) ? note.createdAt : Date.now()
    }))

export const parseNoteValue = (value?: string): NoteEntry[] => {
  if (!value || !value.trim()) return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (Array.isArray(parsed) && parsed.every(isNoteEntry)) {
      return normalizeNotes(parsed)
    }
  } catch {
    // Fall back to treating the value as a legacy single note.
  }
  return normalizeNotes([{ text: value, createdAt: 0 }])
}

export const serializeNoteValue = (notes: NoteEntry[]): string => {
  const normalized = normalizeNotes(notes)
  if (normalized.length === 0) return ''
  return JSON.stringify(normalized)
}
