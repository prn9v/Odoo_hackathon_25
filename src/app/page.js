"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

const mockQuestions = [
  {
    id: 1,
    title: "How to join 2 columns in a data set to make a separate column in SQL",
    description:
      "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name and column 2 consists of last name I want a column to combine...",
    tags: ["sql", "database"],
    author: "User Name",
    answers: 5,
    votes: 12,
    createdAt: "2 hours ago"
  },
  {
    id: 2,
    title: "React useState not updating immediately",
    description:
      "I'm having trouble with useState not updating the state immediately after calling the setter function...",
    tags: ["react", "javascript", "hooks"],
    author: "John Doe",
    answers: 3,
    votes: 8,
    createdAt: "4 hours ago"
  },
  {
    id: 3,
    title: "Best practices for API error handling in Node.js",
    description: "What are the recommended approaches for handling errors in REST APIs built with Node.js and Express?",
    tags: ["nodejs", "express", "api"],
    author: "Jane Smith",
    answers: 2,
    votes: 15,
    createdAt: "1 day ago"
  }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="answers">Most Answers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Questions</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ask Question Button */}
        <div className="mb-6">
          <Link href="/ask">
            <Button className="bg-blue-600 hover:bg-blue-700">Ask New Question</Button>
          </Link>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {mockQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Vote and Answer Count */}
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-600 min-w-[80px]">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{question.votes}</div>
                      <div>votes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg text-green-600">{question.answers}</div>
                      <div>answers</div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <Link href={`/questions/${question.id}`}>
                      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">
                        {question.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 mb-3 line-clamp-2">{question.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        asked by <span className="font-medium">{question.author}</span>
                      </span>
                      <span>{question.createdAt}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {[1, 2, 3, 4, 5, 6, 7].map((page) => (
            <Button
              key={page}
              variant={page === 1 ? "default" : "outline"}
              size="sm"
              className="w-8 h-8"
            >
              {page}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
