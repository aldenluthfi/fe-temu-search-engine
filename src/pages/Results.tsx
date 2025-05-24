import React, { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Tags,
  TagsTrigger,
  TagsContent,
  TagsInput,
  TagsList,
  TagsItem,
  TagsEmpty,
  TagsValue,
  TagsGroup,
} from "@/components/ui/kibo-ui/tags"

type Result = {
  title: string
  snippet?: string
  score?: number
  plot?: string
  tags?: string[]
  source?: string
}

type GroupedResult = {
  title: string
  items: Result[]
}

const Results: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("query") ?? "")
  const [results, setResults] = useState<GroupedResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [llmEnhanced, setLlmEnhanced] = useState(searchParams.get("llm") === "1")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
      ? `http://api.temusearch.nabilmuafa.com/llm/enhanced-search?query=${encodeURIComponent(q)}`
      : `http://api.temusearch.nabilmuafa.com/search?query=${encodeURIComponent(q)}`
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch results")
        const result = res.json()
        return result
      })
      .then(data => {
        const arr: Result[] = data.results ?? data
        const grouped: Record<string, Result[]> = {}
        arr.forEach(r => {
          if (!grouped[r.title]) grouped[r.title] = []
          const key = `${r.plot}|||${r.source}`
          if (!grouped[r.title].some(x => `${x.plot}|||${x.source}` === key)) {
            grouped[r.title].push(r)
          }
        })
        const groupedArr: GroupedResult[] = Object.entries(grouped).map(([title, items]) => ({
          title,
          items
        }))
        setResults(groupedArr)
      })
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

  function addTagsToSet(items: Result[], tagSet: Set<string>) {
    items.forEach(r => {
      if (r.tags) {
        r.tags.forEach(tag => tagSet.add(tag))
      }
    })
  }

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    results.forEach(group => {
      addTagsToSet(group.items, tagSet)
    })
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  }, [results])

  const [tagInput, setTagInput] = useState("")
  const [dropdownKey, setDropdownKey] = useState(0)

  useEffect(() => {
    setDropdownKey(prev => prev + 1)
  }, [allTags.length])

  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return allTags
    return allTags.filter(tag =>
      tag.toLowerCase().includes(tagInput.trim().toLowerCase())
    )
  }, [allTags, tagInput])

  const filteredResults = useMemo(() => {
    if (!selectedTags.length) return results
    return results
      .map(group => ({
        ...group,
        items: group.items.filter(r =>
          selectedTags.every(tag => (r.tags ?? []).includes(tag))
        )
      }))
      .filter(group => group.items.length > 0)
  }, [results, selectedTags])

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const handleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      handleRemoveTag(tag)
    } else {
      setSelectedTags(prev => [...prev, tag])
    }
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
      <div className="w-full max-w-md mb-4">
        <Tags
          key={dropdownKey}
          value={selectedTags.join(",")}
          setValue={v => setSelectedTags(v ? v.split(",") : [])}
        >
          <TagsTrigger>
            {selectedTags.map(tag => (
              <TagsValue key={tag} onRemove={() => handleRemoveTag(tag)}>
                {tag}
              </TagsValue>
            ))}
          </TagsTrigger>
          <TagsContent>
            <TagsInput
              placeholder="Filter tags..."
              value={tagInput}
              onValueChange={setTagInput}
            />
            <TagsList>
              <TagsEmpty />
              <TagsGroup>
                {filteredTags.map(tag => (
                  <TagsItem
                    key={tag}
                    value={tag}
                    onSelect={() => handleSelectTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <CheckIcon size={14} className="text-muted-foreground ml-2" />
                    )}
                  </TagsItem>
                ))}
              </TagsGroup>
            </TagsList>
          </TagsContent>
        </Tags>
      </div>
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
      <div className="w-full max-w-2xl pb-20">
        {!loading && !error && filteredResults.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredResults.reduce((acc, group) => acc + group.items.length, 0)} result{filteredResults.reduce((acc, group) => acc + group.items.length, 0) !== 1 ? "s" : ""} found
          </div>
        )}
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
        {!loading && !error && filteredResults.length === 0 && query && (
          <div>No results found.</div>
        )}
        {!loading && !error && filteredResults.length > 0 && (
          <ul className="space-y-4">
            {filteredResults.map((group, i) => (
              <li key={i + 1}>
                <Card>
                  <CardHeader>
                    <CardTitle>{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {group.items.map((r, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <Separator className="my-4" />}
                        {r.plot && (
                          <div className="text-sm text-muted-foreground mb-1">
                            {r.plot.length > 300
                              ? r.plot.slice(0, 300) + "..."
                              : r.plot}
                          </div>
                        )}
                        {r.snippet && <div className="text-muted-foreground">{r.snippet}</div>}
                        {r.tags && r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {r.tags.map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                className="bg-muted text-xs px-2 py-0.5 rounded-full border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {r.source && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Source: <span className="font-mono">{r.source}</span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
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
