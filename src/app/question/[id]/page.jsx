"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronUp, ChevronDown, Check } from "lucide-react"
import { Header } from "@/components/header"
import { RichTextEditor } from "@/components/rich-text-editor"
import Link from "next/link"

const mockQuestion = {
  id: 1,
  title: "How to join 2 columns in a data set to make a separate column in SQL",
  description:
    "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name and column 2 consists of last name I want a column to combine both first name and last name.",
  tags: ["sql", "database"],
  author: "User Name",
  votes: 12,
  createdAt: "2 hours ago",
}

const mockAnswers = [
  {
    id: 1,
    content:
      "You can use the CONCAT function or the || operator to join columns in SQL. Here are a few approaches:\n\n**Using CONCAT function:**\n```sql\nSELECT CONCAT(first_name, ' ', last_name) AS full_name\nFROM your_table;\n```\n\n**Using || operator:**\n```sql\nSELECT first_name || ' ' || last_name AS full_name\nFROM your_table;\n```",
    author: "SQL Expert",
    votes: 8,
    isAccepted: true,
    createdAt: "1 hour ago",
  },
  {
    id: 2,
    content:
      "Another approach is to use the CONCAT_WS function which handles NULL values better:\n\n```sql\nSELECT CONCAT_WS(' ', first_name, last_name) AS full_name\nFROM your_table;\n```\n\nThis will automatically handle cases where one of the columns might be NULL.",
    author: "Database Pro",
    votes: 5,
    isAccepted: false,
    createdAt: "30 minutes ago",
  },
]

export default function QuestionDetailPage() {
  const [newAnswer, setNewAnswer] = useState("")
  const [userVotes, setUserVotes] = useState({})

  const handleVote = (type, id, voteType) => {
    const key = `${type}-${id}`
    setUserVotes((prev) => ({
      ...prev,
      [key]: prev[key] === voteType ? null : voteType,
    }))
  }

  const handleSubmitAnswer = (e) => {
    e.preventDefault()
    console.log({ answer: newAnswer })
    setNewAnswer("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Questions
          </Link>
          <span className="mx-2">{">"}</span>
          <span>How to join 2...</span>
        </nav>

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("question", mockQuestion.id, "up")}
                  className={`p-2 ${userVotes[`question-${mockQuestion.id}`] === "up" ? "text-orange-600" : "text-gray-400"}`}
                >
                  <ChevronUp className="w-6 h-6" />
                </Button>
                <span className="text-xl font-semibold">{mockQuestion.votes}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("question", mockQuestion.id, "down")}
                  className={`p-2 ${userVotes[`question-${mockQuestion.id}`] === "down" ? "text-orange-600" : "text-gray-400"}`}
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{mockQuestion.title}</h1>
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed">{mockQuestion.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mockQuestion.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  asked by <span className="font-medium">{mockQuestion.author}</span> {mockQuestion.createdAt}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{mockAnswers.length} Answers</h2>
          <div className="space-y-4">
            {mockAnswers.map((answer) => (
              <Card key={answer.id} className={answer.isAccepted ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("answer", answer.id, "up")}
                        className={`p-2 ${userVotes[`answer-${answer.id}`] === "up" ? "text-orange-600" : "text-gray-400"}`}
                      >
                        <ChevronUp className="w-6 h-6" />
                      </Button>
                      <span className="text-xl font-semibold">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote("answer", answer.id, "down")}
                        className={`p-2 ${userVotes[`answer-${answer.id}`] === "down" ? "text-orange-600" : "text-gray-400"}`}
                      >
                        <ChevronDown className="w-6 h-6" />
                      </Button>
                      {answer.isAccepted && (
                        <div className="text-green-600 mt-2">
                          <Check className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      <div className="prose max-w-none mb-4">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {answer.content}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        answered by <span className="font-medium">{answer.author}</span> {answer.createdAt}
                        {answer.isAccepted && <span className="ml-2 text-green-600 font-medium">✓ Accepted</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Submit Answer */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Submit Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor value={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
              <div className="flex gap-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Submit Answer
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
