import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Summary } from '@packages/contract'

const STORAGE_KEY = 'klerek_summary'

interface SummaryContextValue {
  summary: Summary | null
  setSummary: (s: Summary) => void
}

const SummaryContext = createContext<SummaryContextValue | null>(null)

function loadFromStorage(): Summary | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Summary) : null
  } catch {
    return null
  }
}

export function SummaryProvider({ children }: { children: ReactNode }) {
  const [summary, setSummaryState] = useState<Summary | null>(loadFromStorage)

  const setSummary = (s: Summary) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    setSummaryState(s)
  }

  return (
    <SummaryContext.Provider value={{ summary, setSummary }}>
      {children}
    </SummaryContext.Provider>
  )
}

export function useSummary() {
  const ctx = useContext(SummaryContext)
  if (!ctx) throw new Error('useSummary must be used within SummaryProvider')
  return ctx
}
