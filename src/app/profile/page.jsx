"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  LinkIcon,
  Edit,
  Award,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUp,
  Check,
  Eye,
  Star,
  Trophy,
  BookOpen,
  LogOut,
  Bell,
} from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [userQuestions, setUserQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (!token) {
        router.push('/login')
        return
      }

      // Try to get user data from API first
      let userData = null
      try {
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (userResponse.ok) {
          userData = await userResponse.json()
        } else {
          // If API fails, use stored user data
          if (storedUser) {
            userData = JSON.parse(storedUser)
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError)
        // Fallback to stored user data
        if (storedUser) {
          userData = JSON.parse(storedUser)
        }
      }

      if (!userData) {
        throw new Error('No user data available')
      }

      setUser(userData)

      // Fetch all questions and filter by current user
      try {
        const questionsResponse = await fetch('/api/questions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (questionsResponse.ok) {
          const response = await questionsResponse.json()
          const allQuestions = response.questions || []
          // Filter questions by current user
          const userQuestionsData = allQuestions.filter(q => q.author?._id === userData._id)
          setUserQuestions(userQuestionsData)
        }
      } catch (questionsError) {
        console.error('Error fetching questions:', questionsError)
        setUserQuestions([])
      }

      // Fetch all answers and filter by current user
      try {
        // First get all questions to find answers
        const questionsResponse = await fetch('/api/questions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (questionsResponse.ok) {
          const response = await questionsResponse.json()
          const allQuestions = response.questions || []
          
          // Collect all answers from all questions
          const allAnswers = []
          for (const question of allQuestions) {
            if (question.answers && Array.isArray(question.answers)) {
              for (const answer of question.answers) {
                if (answer.owner?._id === userData._id) {
                  allAnswers.push({
                    ...answer,
                    questionId: question._id,
                    questionTitle: question.title
                  })
                }
              }
            }
          }
          setUserAnswers(allAnswers)
        }
      } catch (answersError) {
        console.error('Error fetching answers:', answersError)
        setUserAnswers([])
      }

      // Fetch user notifications
      try {
        const notificationsResponse = await fetch('/api/notification', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (notificationsResponse.ok) {
          const response = await notificationsResponse.json()
          setNotifications(response.notifications || [])
        }
      } catch (notificationsError) {
        console.error('Error fetching notifications:', notificationsError)
        setNotifications([])
      }

    } catch (err) {
      setError(err.message)
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "answer":
        return <MessageSquare className="w-4 h-4 text-green-600" />
      case "question":
        return <BookOpen className="w-4 h-4 text-blue-600" />
      case "vote":
        return <ArrowUp className="w-4 h-4 text-purple-600" />
      case "accept":
        return <Check className="w-4 h-4 text-green-600" />
      case "notification":
        return <Bell className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-600" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to view your profile</p>
          <Button onClick={() => router.push('/login')}>Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="bg-white border-slate-200 mb-6">
            <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {user.name || user.email}
                    </h1>
                    <p className="text-lg text-slate-600 mb-4">@{user.email}</p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4">
                  {user.bio || "No bio available"}
                </p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a href={user.website} className="text-blue-600 hover:underline">
                        {user.website.replace("https://", "")}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-800">{userQuestions.length}</div>
                    <div className="text-sm text-blue-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-800">{userAnswers.length}</div>
                    <div className="text-sm text-green-600">Answers</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-800">{user.totalVotes || 0}</div>
                    <div className="text-sm text-purple-600">Votes</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-800">{notifications.length}</div>
                    <div className="text-sm text-orange-600">Notifications</div>
                  </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions ({userQuestions.length})</TabsTrigger>
            <TabsTrigger value="answers">Answers ({userAnswers.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-slate-200">
            <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
            </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Show recent questions */}
                      {userQuestions.slice(0, 2).map((question) => (
                        <div key={question._id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">asked</span>{" "}
                              <Link href={`/question/${question._id}`} className="text-blue-600 hover:underline">
                                {question.title}
                              </Link>
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>{formatTimeAgo(question.createdAt)}</span>
                              <span>•</span>
                              <span>{question.votes || 0} votes</span>
                  </div>
                </div>
                  </div>
                      ))}
                      
                      {/* Show recent answers */}
                      {userAnswers.slice(0, 2).map((answer) => (
                        <div key={answer._id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">answered</span>{" "}
                              <Link href={`/question/${answer.questionId}`} className="text-blue-600 hover:underline">
                                {answer.questionTitle || 'a question'}
                              </Link>
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>{formatTimeAgo(answer.createdAt)}</span>
                              <span>•</span>
                              <span>{answer.votes || 0} votes</span>
                </div>
                  </div>
                </div>
                      ))}

                      {/* Show recent notifications */}
                      {notifications.slice(0, 3).map((notification) => (
                        <div key={notification._id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg">
                          <Bell className="w-4 h-4 text-orange-600" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              {!notification.read && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 font-medium">New</span>
                                </>
                              )}
                  </div>
                </div>
              </div>
                      ))}
                    </div>
                    {(userQuestions.length === 0 && userAnswers.length === 0 && notifications.length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No activity yet. Start by asking a question!</p>
                      </div>
                    )}
            </CardContent>
          </Card>
        </div>

              {/* Quick Stats */}
              <div>
                <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-700">Questions Asked</span>
                        <span className="font-bold text-blue-800">{userQuestions.length}</span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-green-700">Answers Given</span>
                        <span className="font-bold text-green-800">{userAnswers.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm text-purple-700">Total Votes</span>
                        <span className="font-bold text-purple-800">{user.totalVotes || 0}</span>
                    </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm text-orange-700">Notifications</span>
                        <span className="font-bold text-orange-800">{notifications.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
            </TabsContent>

          {/* Questions Tab */}
            <TabsContent value="questions">
            <Card className="bg-white border-slate-200">
                <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Questions ({userQuestions.length})
                  </span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/ask')}>
                    Ask Question
                  </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {userQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No questions yet</h3>
                    <p className="text-slate-500 mb-4">Start contributing to the community by asking your first question!</p>
                    <Button onClick={() => router.push('/ask')}>Ask Your First Question</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userQuestions.map((question) => (
                      <div key={question._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/question/${question._id}`}>
                              <h3 className="font-semibold text-slate-800 hover:text-blue-600 mb-2">{question.title}</h3>
                            </Link>
                            <p className="text-slate-600 mb-3 line-clamp-2">{question.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {question.tags && question.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <ArrowUp className="w-4 h-4" />
                                <span>{question.votes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{question.answers?.length || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{question.views || 0}</span>
                              </div>
                              <span>{formatTimeAgo(question.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>

          {/* Answers Tab */}
            <TabsContent value="answers">
            <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                    Answers ({userAnswers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {userAnswers.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No answers yet</h3>
                    <p className="text-slate-500 mb-4">Start helping others by answering questions!</p>
                    <Button onClick={() => router.push('/')}>Browse Questions</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAnswers.map((answer) => (
                      <div key={answer._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/question/${answer.questionId}`}>
                              <h3 className="font-semibold text-slate-800 hover:text-blue-600 mb-2">
                                {answer.questionTitle || 'Question'}
                            </h3>
                            </Link>
                            <p className="text-slate-600 mb-3 line-clamp-2">{answer.content}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <ArrowUp className="w-4 h-4" />
                                <span>{answer.votes || 0}</span>
                              </div>
                              <span>{formatTimeAgo(answer.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}