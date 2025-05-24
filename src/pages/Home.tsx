import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Switch } from "@/components/ui/switch"

const Home: React.FC = () => {
  const [query, setQuery] = useState('')
  const [llmEnhanced, setLlmEnhanced] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const params = new URLSearchParams({ query })
      if (llmEnhanced) params.set("llm", "1")
      navigate(`/results?${params.toString()}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-2">
      <h1 className="text-5xl sm:text-8xl font-bold mb-6 text-center">TəmuSəarch</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 w-full max-w-md items-center"
      >
        <Input
          type="text"
          placeholder="Type your search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full text-base sm:text-lg py-2 sm:py-3"
        />
        <Button
          type="submit"
          className="w-full sm:w-auto text-base sm:text-lg py-2 sm:py-3"
        >
          <Search className="mr-2" />
          Search
        </Button>
      </form>
      <div className="w-full max-w-md mt-2 mb-2 flex justify-start">
        <div className="flex items-center">
          <Switch
            checked={llmEnhanced}
            onCheckedChange={setLlmEnhanced}
            id="llm-enhanced-switch"
          />
          <label htmlFor="llm-enhanced-switch" className="ml-2 text-sm select-none">
            LLM Enhanced
          </label>
        </div>
      </div>
    </div>
  )
}

export default Home
