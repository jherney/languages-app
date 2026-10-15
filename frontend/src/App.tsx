import { useEffect, useState } from "react"

interface Language {
  id: string
  name: string
  paradigm: string
  year: number
  creator: string
  typing: string
  gc: string
  concurrency: string
  logo: string
}

// "async/await, threads" -> ["async/await", "threads"]
const concurrencyModels = (lang: Language) => lang.concurrency.split(",").map(s => s.trim())

const uniqueSorted = (values: string[]) => [...new Set(values)].sort()

function typingClass(typing: string) {
  return typing === "dynamic" ? "tag-dynamic" : "tag-static"
}

function gcClass(gc: string) {
  return gc === "none" ? "tag-no-gc" : "tag-gc"
}

function concurrencyClass(concurrency: string) {
  if (concurrency.includes("goroutines")) return "tag-concurrency-goroutines"
  if (concurrency.includes("event loop")) return "tag-concurrency-event"
  return "tag-concurrency-async"
}

function LanguageCard({ lang }: { lang: Language }) {
  return (
    <article className="card">
      <h3 className="text-lg font-semibold mb-1">{lang.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{lang.year} • {lang.creator}</p>
      <div className="flex flex-wrap gap-1">
        <span className={`tag ${typingClass(lang.typing)}`}>{lang.typing}</span>
        <span className={`tag ${gcClass(lang.gc)}`}>{lang.gc}</span>
        <span className={`tag ${concurrencyClass(lang.concurrency)}`}>{lang.concurrency}</span>
      </div>
    </article>
  )
}

function FilterSelect({ label, value, options, onChange }: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-gray-300">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
      >
        <option value="">All</option>
        {options.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </label>
  )
}

export default function App() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [error, setError] = useState("")
  const [paradigmFilter, setParadigmFilter] = useState("")
  const [gcFilter, setGcFilter] = useState("")
  const [concurrencyFilter, setConcurrencyFilter] = useState("")

  useEffect(() => {
    fetch("/api/v1/languages")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setLanguages)
      .catch(e => setError(`Could not load languages: ${e.message}`))
  }, [])

  const filtered = languages.filter(lang =>
    (!paradigmFilter || lang.paradigm === paradigmFilter) &&
    (!gcFilter || lang.gc === gcFilter) &&
    (!concurrencyFilter || concurrencyModels(lang).includes(concurrencyFilter))
  )

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Languages Wiki</h1>
        <p className="text-sm text-gray-400">Curated catalog of programming languages</p>
      </header>

      <section className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FilterSelect label="Paradigm" value={paradigmFilter} onChange={setParadigmFilter}
          options={uniqueSorted(languages.map(l => l.paradigm))} />
        <FilterSelect label="GC" value={gcFilter} onChange={setGcFilter}
          options={uniqueSorted(languages.map(l => l.gc))} />
        <FilterSelect label="Concurrency" value={concurrencyFilter} onChange={setConcurrencyFilter}
          options={uniqueSorted(languages.flatMap(concurrencyModels))} />
      </section>

      <main className="p-4">
        {error && <p role="alert" className="text-red-400">{error}</p>}
        {!error && languages.length > 0 && filtered.length === 0 && (
          <p className="text-gray-400">No languages match these filters.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(lang => (
            <LanguageCard key={lang.id} lang={lang} />
          ))}
        </div>
      </main>
    </div>
  )
}
