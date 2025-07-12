"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RichTextEditor } from "@/components/RichTextEditor"
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, Flag, Check, Clock, Eye, Award, Edit, Loader2 } from "lucide-react"

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function QuestionPage({ params }) {

  console.log("id",params.id)
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  // Fetch question and answers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        // Fetch question details
        const qRes = await fetch(`/api/questions/${params.id}`)

        console.log("res: ",qRes);
        if (!qRes.ok) throw new Error("Failed to fetch question")
        const qData = await qRes.json()
        setQuestion(qData.question)

        // Fetch answers for this question
        const aRes = await fetch(`/api/answer?questionId=${params.id}`)
        if (!aRes.ok) throw new Error("Failed to fetch answers")
        const aData = await aRes.json()
        setAnswers(aData.answers || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const handleVote = (type, targetType, targetId) => {
    // Implement vote API call here
    console.log(`Voted ${type} on ${targetType}`, targetId)
  }

  const handleAcceptAnswer = async (answerId) => {
    // Implement accept answer API call here
    console.log(`Accepted ${answerId}`)
  }

  const submitAnswer = async () => {
    if (!newAnswer.trim()) return
    setSubmittingAnswer(true)
    setError("")
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error("You must be logged in to answer")
      const res = await fetch('/api/answer', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: params.id,
          content: newAnswer
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to post answer")
      setAnswers([data.answer, ...answers])
      setNewAnswer("")
      setShowAnswerForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Question not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Question */}
        <Card className="bg-white border-slate-200 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">{question.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Asked {formatTimeAgo(question.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{question.views || 0} views</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {question.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4 mr-1" />
                  Flag
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2 min-w-[60px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("up", "question", question._id)}
                  className="p-2 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <span className="text-xl font-semibold text-slate-700">{question.votes || 0}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote("down", "question", question._id)}
                  className="p-2 h-10 w-10 hover:bg-red-50 hover:text-red-600"
                >
                  <ArrowDown className="w-5 h-5" />
                </Button>
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <div className="prose max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: question.description?.replace(/\n/g, "<br>") }} />
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={question.author?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {question.author?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800">{question.author?.name || "Anonymous"}</p>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Award className="w-3 h-3" />
                        <span>{question.author?.reputation?.toLocaleString() || 0} reputation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <Card className="bg-white border-slate-200 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">
                Answers ({answers.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswerForm((prev) => !prev)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {showAnswerForm ? "Cancel" : "Add Answer"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Answer Form */}
            {showAnswerForm && (
              <div className="mb-8">
                <RichTextEditor
                  value={newAnswer}
                  onChange={setNewAnswer}
                  placeholder="Write your answer here..."
                  disabled={submittingAnswer}
                />
                <div className="flex gap-3 mt-3">
                  <Button
                    onClick={submitAnswer}
                    disabled={submittingAnswer || !newAnswer.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submittingAnswer ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Answer"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswerForm(false)}
                    disabled={submittingAnswer}
                  >
                    Cancel
                  </Button>
                </div>
                {error && <p className="text-red-600 mt-2">{error}</p>}
              </div>
            )}

            {/* Answers List */}
            {answers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No answers yet. Be the first to answer!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer) => (
                  <div
                    key={answer._id}
                    className={`p-4 border border-slate-200 rounded-lg hover:bg-slate-50 relative ${
                      answer.accepted ? "border-green-400 bg-green-50" : ""
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-2 min-w-[60px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote("up", "answer", answer._id)}
                          className="p-2 h-10 w-10 hover:bg-green-50 hover:text-green-600"
                          disabled={!currentUser || answer.owner?._id === currentUser?._id}
                        >
                          <ArrowUp className="w-5 h-5" />
                        </Button>
                        <span className="text-xl font-semibold text-slate-700">
                          {answer.votes || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote("down", "answer", answer._id)}
                          className="p-2 h-10 w-10 hover:bg-red-50 hover:text-red-600"
                          disabled={!currentUser || answer.owner?._id === currentUser?._id}
                        >
                          <ArrowDown className="w-5 h-5" />
                        </Button>
                      </div>
                      {/* Answer Content */}
                      <div className="flex-1">
                        <div className="prose max-w-none mb-4">
                          <div dangerouslySetInnerHTML={{ __html: answer.content?.replace(/\n/g, "<br>") }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {answer.accepted && (
                              <span className="flex items-center text-green-600 font-semibold">
                                <Check className="w-4 h-4 mr-1" />
                                Accepted
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatTimeAgo(answer.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={answer.owner?.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {answer.owner?.name?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-800">
                                {answer.owner?.name || "Anonymous"}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Accept Answer Button (if user is question author and not already accepted) */}
                        {currentUser && question.author?._id === currentUser._id && !answer.accepted && (
                          <Button
                            variant="success"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleAcceptAnswer(answer._id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept Answer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}