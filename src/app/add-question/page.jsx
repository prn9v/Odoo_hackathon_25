"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RichTextEditor } from "@/components/RichTextEditor"
import { X, Plus, HelpCircle, Tag, FileText, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const popularTags = [
  "React",
  "JavaScript",
  "Node.js",
  "Python",
  "CSS",
  "HTML",
  "TypeScript",
  "Next.js",
  "Express",
  "MongoDB",
]

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const addTag = (tag) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Validation
      if (!title.trim()) {
        throw new Error("Title is required")
      }

      if (!description.trim()) {
        throw new Error("Description is required")
      }

      if (title.length < 10) {
        throw new Error("Title must be at least 10 characters long")
      }

      if (description.length < 20) {
        throw new Error("Description must be at least 20 characters long")
      }

      if (tags.length === 0) {
        throw new Error("At least one tag is required")
      }

      // Get authentication token
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Prepare question data
      const questionData = {
        title: title.trim(),
        description: description.trim(),
        tags: tags
      }

      // Submit to API
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create question')
      }

      // Success - redirect to the new question
      router.push(`/question/${result.question._id}`)

    } catch (err) {
      setError(err.message)
      console.error('Error creating question:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Ask a Question</h1>
          <p className="text-slate-600">Get help from the community by asking a clear, detailed question</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Question Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., How to implement JWT authentication in React?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white border-slate-200"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-slate-500">
                      Be specific and imagine you're asking a question to another person
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700">Description *</Label>
                      <Tabs
                        value={isPreview ? "preview" : "write"}
                        onValueChange={(v) => setIsPreview(v === "preview")}
                      >
                        <TabsList className="grid w-fit grid-cols-2">
                          <TabsTrigger value="write" className="text-xs">
                            Write
                          </TabsTrigger>
                          <TabsTrigger value="preview" className="text-xs">
                            Preview
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {isPreview ? (
                      <div className="min-h-[200px] p-4 border border-slate-200 rounded-md bg-slate-50">
                        <div dangerouslySetInnerHTML={{ __html: description || "<p>Nothing to preview</p>" }} />
                      </div>
                    ) : (
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        placeholder="Provide details about your question. Include what you've tried and what specific help you need..."
                        disabled={isSubmitting}
                      />
                    )}
                    <p className="text-xs text-slate-500">
                      Include all the information someone would need to answer your question
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Tags *</Label>

                    {/* Selected Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            {tag}
                            <button 
                              type="button" 
                              onClick={() => removeTag(tag)} 
                              className="ml-2 hover:text-blue-600"
                              disabled={isSubmitting}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add Tag Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag(newTag)
                          }
                        }}
                        className="bg-white border-slate-200"
                        disabled={tags.length >= 5 || isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addTag(newTag)}
                        disabled={!newTag || tags.length >= 5 || isSubmitting}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Popular Tags */}
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">Popular tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`cursor-pointer hover:bg-slate-100 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isSubmitting && addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">Add up to 5 tags to describe what your question is about</p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting Question...
                        </>
                      ) : (
                        'Post Question'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => router.push('/')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <HelpCircle className="w-5 h-5" />
                  Writing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-amber-700">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Summarize your problem in a one-line title</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Describe your problem in more detail</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Describe what you tried and what you expected to happen</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Add relevant tags to help others find your question</p>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines Card */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Tag className="w-5 h-5" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-green-700">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Be respectful and constructive</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Search for existing answers first</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Provide code examples when relevant</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <p>Accept helpful answers to help others</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}