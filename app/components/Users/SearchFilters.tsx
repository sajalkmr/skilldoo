'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchFiltersProps {
  onSearch: (query: string) => void
  onClearSearch: () => void
  searchQuery: string
  isLoading?: boolean
}

export default function SearchFilters({ 
  onSearch, 
  onClearSearch, 
  searchQuery, 
  isLoading = false 
}: SearchFiltersProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localQuery.trim())
  }

  const handleClear = () => {
    setLocalQuery('')
    onClearSearch()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search by name, location, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          
          {(searchQuery || localQuery) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          )}
        </div>
      </form>
      
      {searchQuery && (
        <div className="mt-4 text-sm text-gray-600">
          Showing results for: <span className="font-medium text-gray-900">"{searchQuery}"</span>
        </div>
      )}
    </div>
  )
} 