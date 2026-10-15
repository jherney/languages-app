import { useEffect, useRef, useState } from "react"

interface Link {
  label: string
  url: string
}

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
  sources?: string[]
  learn?: {
    intro: string
    hello: string
    run: string
    resources: Link[]
  }
}

// "async/await, threads" -> ["async/await", "threads"]
const concurrencyModels = (lang: Language) => lang.concurrency.split(",").map(s => s.trim())

const uniqueSorted = (values: string[]) => [...new Set(values)].sort()

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, "")

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

function Tags({ lang }: { lang: Language }) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className={`tag ${typingClass(lang.typing)}`}>{lang.typing}</span>
      <span className={`tag ${gcClass(lang.gc)}`}>{lang.gc}</span>
      <span className={`tag ${concurrencyClass(lang.concurrency)}`}>{lang.concurrency}</span>
    </div>
  )
}

function LanguageCard({ lang, onOpen }: { lang: Language; onOpen: () => void }) {
  return (
    <article className="card relative focus-within:ring-2 focus-within:ring-teal-400">
      <h3 className="text-lg font-semibold mb-1">
        {/* The ::after overlay stretches the button across the whole card */}
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          className="text-left focus:outline-none after:absolute after:inset-0 after:cursor-pointer after:content-['']"
        >
          {lang.name}
        </button>
      </h3>
      <p className="text-sm text-gray-400 mb-3">{lang.year} • {lang.creator}</p>
      <Tags lang={lang} />
      {lang.learn && <p className="mt-3 text-xs text-teal-300">Getting started →</p>}
    </article>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <figure className="mt-3">
      <figcaption className="text-xs uppercase tracking-wide text-gray-400 mb-1">{label}</figcaption>
      <pre className="overflow-x-auto rounded bg-black/60 border border-gray-800 p-3 text-sm"><code>{code}</code></pre>
    </figure>
  )
}

function LanguageDialog({ lang, onClose }: { lang: Language | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current!
    // closedby="any" closes the dialog on a backdrop click. React 18 has no
    // typing for it, so set it directly.
    dialog.setAttribute("closedby", "any")
    if ("closedBy" in HTMLDialogElement.prototype) return
    // Fallback for browsers without closedby (Safari): close on backdrop clicks.
    const onClick = (event: MouseEvent) => {
      if (event.target !== dialog) return
      const rect = dialog.getBoundingClientRect()
      const inside = rect.top <= event.clientY && event.clientY <= rect.bottom &&
        rect.left <= event.clientX && event.clientX <= rect.right
      if (!inside) dialog.close()
    }
    dialog.addEventListener("click", onClick)
    return () => dialog.removeEventListener("click", onClick)
  }, [])

  useEffect(() => {
    if (lang && !ref.current!.open) ref.current!.showModal()
  }, [lang])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="language-dialog-title"
      className="language-dialog w-[min(42rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] m-auto rounded-xl border border-gray-700 bg-gray-900 text-gray-100 p-0"
    >
      {lang && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="language-dialog-title" className="text-2xl font-bold">{lang.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{lang.year} • {lang.creator} • {lang.paradigm}</p>
            </div>
            <form method="dialog">
              <button type="submit" aria-label="Close" className="rounded px-2 py-1 text-xl leading-none text-gray-400 hover:text-white hover:bg-gray-800">
                ×
              </button>
            </form>
          </div>
          <div className="mt-3"><Tags lang={lang} /></div>

          {lang.learn ? (
            <section className="mt-6">
              <h3 className="text-lg font-semibold">Getting started</h3>
              <p className="mt-2 text-gray-300 leading-relaxed">{lang.learn.intro}</p>
              <CodeBlock label="Hello, world" code={lang.learn.hello} />
              <CodeBlock label="Run it" code={lang.learn.run} />
              <h4 className="mt-5 font-semibold">Learning resources</h4>
              <ul className="mt-2 space-y-1">
                {lang.learn.resources.map(r => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-teal-300 underline hover:text-teal-200">
                      {r.label}
                    </a>
                    <span className="text-xs text-gray-500"> · {hostname(r.url)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="mt-6 text-gray-400">No getting-started guide for this language yet.</p>
          )}

          {lang.sources && lang.sources.length > 0 && (
            <p className="mt-6 text-xs text-gray-400">
              Sources for the facts above:{" "}
              {lang.sources.map((url, i) => (
                <span key={url}>
                  {i > 0 && ", "}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-200">
                    {hostname(url)}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </dialog>
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
  const [selected, setSelected] = useState<Language | null>(null)

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
        <p className="text-sm text-gray-400">Curated catalog of programming languages. Select a card to see how to get started.</p>
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
            <LanguageCard key={lang.id} lang={lang} onOpen={() => setSelected(lang)} />
          ))}
        </div>
      </main>

      <LanguageDialog lang={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
