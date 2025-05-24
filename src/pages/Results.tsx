import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

type Result = {
  title: string
  snippet?: string
  score?: number
  plot?: string
  tags?: string[]
}

const Results: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("query") ?? "")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [llmEnhanced, setLlmEnhanced] = useState(searchParams.get("llm") === "1")

  useEffect(() => {
    const q = searchParams.get("query") ?? ""
    setQuery(q)
    setLlmEnhanced(searchParams.get("llm") === "1")
    if (!q) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    const endpoint = llmEnhanced
      ? `http://localhost:8000/llm/enhanced-search?query=${encodeURIComponent(q)}`
      : `http://localhost:8000/search?query=${encodeURIComponent(q)}`
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch results")
        const result = res.json()
        console.log("Search results:", result)
        return result
      })
      .then(data => setResults(data.results ?? data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [searchParams, llmEnhanced])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams([
      ["query", query],
      ...(llmEnhanced ? [["llm", "1"] as [string, string]] : [])
    ])
  }

  const handleLlmSwitch = (checked: boolean) => {
    setLlmEnhanced(checked)
    setSearchParams([
      ["query", query],
      ...(checked ? [["llm", "1"] as [string, string]] : [])
    ])
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background px-4">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md mt-8 mb-2 items-center">
        <Input
          type="text"
          placeholder="Type your search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Button type="submit">
          <Search className="mr-2" />
          Search
        </Button>
      </form>
      <div className="w-full max-w-md mb-6 flex justify-start">
        <div className="flex items-center">
          <Switch
            checked={llmEnhanced}
            onCheckedChange={handleLlmSwitch}
            id="llm-enhanced-switch"
          />
          <label htmlFor="llm-enhanced-switch" className="ml-2 text-sm select-none">
            LLM Enhanced
          </label>
        </div>
      </div>
      <div className="w-full max-w-2xl">
        {loading && (
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i + 1}>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3 mb-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/4 mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
        {error && <div className="text-red-500">Error: {error}</div>}
        {!loading && !error && results.length === 0 && query && (
          <div>No results found.</div>
        )}
        {!loading && !error && results.length > 0 && (
          <ul className="space-y-4">
            {results.map((r, i) => (
              <li key={i + 1}>
                <Card>
                  <CardHeader>
                    <CardTitle>{r.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {typeof r.score === "number" && (
                      <div className="text-sm text-muted-foreground mb-1">Score: {r.score}</div>
                    )}
                    {r.plot && (
                      <div className="text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Plot:</span> {r.plot}
                      </div>
                    )}
                    {r.snippet && <div className="text-muted-foreground">{r.snippet}</div>}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-muted text-xs px-2 py-0.5 rounded-full border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Results
