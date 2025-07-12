"use client"
import { useState, useEffect } from "react"
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
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  User, 
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Check,
  Plus,
  Hash,
  Calendar,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function StackitPlatform() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})

  // AI Feature States
  const [summaries, setSummaries] = useState({})
  const [abuseChecks, setAbuseChecks] = useState({})
  const [factChecks, setFactChecks] = useState({})
  const [improvements, setImprovements] = useState({})
  const [aiAnswers, setAiAnswers] = useState({})
  const [loadingStates, setLoadingStates] = useState({})

  // Add these state variables at the top of the component
  const [answerForms, setAnswerForms] = useState({});
  const [answerLoading, setAnswerLoading] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    fetchQuestions();
  }, [currentPage, searchQuery, sortBy, filterBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        sort: sortBy
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/questions?${params}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      const questionsData = data.questions || [];
      setQuestions(questionsData);
      setPagination(data.pagination || {});

      // Fetch answers for each question
      await fetchAnswersForQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswersForQuestions = async (questionsData) => {
    try {
      const token = localStorage.getItem('token');
      const answersData = {};

      for (const question of questionsData) {
        const params = new URLSearchParams({
          questionId: question._id,
          limit: 50,
          sort: 'newest'
        });

        const headers = {
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/answer?${params}`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          answersData[question._id] = data.answers || [];
        } else {
          console.error(`Failed to fetch answers for question ${question._id}`);
          answersData[question._id] = [];
        }
      }

      setAnswers(answersData);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  // API Helper Function
  const callEdithAPI = async (endpoint, text) => {
    const response = await fetch(`https://r-odoo.vercel.app//edith/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }
    return await response.json()
  }

  // AI Feature Handlers
  const handleSummarize = async (questionId, text) => {
    setLoadingStates(prev => ({ ...prev, [`summarize-${questionId}`]: true }))
    try {
      const result = await callEdithAPI("summarize", text)
      setSummaries(prev => ({ ...prev, [questionId]: result.summary }))
    } catch (error) {
      console.error("Error summarizing:", error)
      setSummaries(prev => ({ ...prev, [questionId]: "Error: " + error.message }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [`summarize-${questionId}`]: false }))
    }
  }

  const handleAbuseCheck = async (questionId, text) => {
    setLoadingStates(prev => ({ ...prev, [`abuse-${questionId}`]: true }))
    try {
      const result = await callEdithAPI("abuse-check", text)
      setAbuseChecks(prev => ({ ...prev, [questionId]: result.result }))
    } catch (error) {
      console.error("Error checking abuse:", error)
      setAbuseChecks(prev => ({ ...prev, [questionId]: "Error: " + error.message }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [`abuse-${questionId}`]: false }))
    }
  }

  const handleFactCheck = async (questionId, text) => {
    setLoadingStates(prev => ({ ...prev, [`fact-${questionId}`]: true }))
    try {
      const result = await callEdithAPI("fact-check", text)
      setFactChecks(prev => ({ ...prev, [questionId]: result.fact_check_result }))
    } catch (error) {
      console.error("Error fact-checking:", error)
      setFactChecks(prev => ({ ...prev, [questionId]: "Error: " + error.message }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [`fact-${questionId}`]: false }))
    }
  }

  const handleImproveQuestion = async (questionId, text) => {
    setLoadingStates(prev => ({ ...prev, [`improve-${questionId}`]: true }))
    try {
      const result = await callEdithAPI("improve-question", text)
      setImprovements(prev => ({ ...prev, [questionId]: result.improvement_suggestions }))
    } catch (error) {
      console.error("Error improving question:", error)
      setImprovements(prev => ({ ...prev, [questionId]: "Error: " + error.message }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [`improve-${questionId}`]: false }))
    }
  }

  const handleAskAI = async (questionId, text) => {
    setLoadingStates(prev => ({ ...prev, [`ask-${questionId}`]: true }))
    try {
      const result = await callEdithAPI("ask", text)
      setAiAnswers(prev => ({ ...prev, [questionId]: result.answer }))
    } catch (error) {
      console.error("Error asking AI:", error)
      setAiAnswers(prev => ({ ...prev, [questionId]: "Error: " + error.message }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [`ask-${questionId}`]: false }))
    }
  }

  const toggleAnswerForm = (questionId) => {
    if (!currentUser) {
      alert('Please log in to answer questions');
      return;
    }

    setAnswerForms(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    setAnswerErrors(prev => ({
      ...prev,
      [questionId]: ''
    }));
  };

  const handleAnswerInputChange = (questionId, value) => {
    setAnswerForms(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Clear error when user starts typing
    if (answerErrors[questionId]) {
      setAnswerErrors(prev => ({
        ...prev,
        [questionId]: ''
      }));
    }
  };

 




  const submitAnswer = async (questionId) => {
    if (!currentUser) {
      alert('Please log in to submit answers');
      return;
    }

    const answerContent = answerForms[questionId];
    
    if (!answerContent || answerContent.trim().length < 10) {
      setAnswerErrors(prev => ({
        ...prev,
        [questionId]: 'Answer must be at least 10 characters long'
      }));
      return;
    }

    try {
      setAnswerLoading(prev => ({ ...prev, [questionId]: true }));
      const token = localStorage.getItem('token');

      const response = await fetch('/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId,
          content: answerContent.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Clear the form and refresh questions and answers
        setAnswerForms(prev => ({ ...prev, [questionId]: '' }));
        setAnswerErrors(prev => ({ ...prev, [questionId]: '' }));
        fetchQuestions(); // Refresh to show the new answer
      } else {
        setAnswerErrors(prev => ({
          ...prev,
          [questionId]: data.message || 'Failed to submit answer'
        }));
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setAnswerErrors(prev => ({
        ...prev,
        [questionId]: 'Network error. Please try again.'
      }));
    } finally {
      setAnswerLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "answered" && (answers[question._id]?.length > 0)) ||
                         (filterBy === "unanswered" && (!answers[question._id] || answers[question._id].length === 0))
    
    return matchesSearch && matchesFilter
  });

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search questions, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 border-2 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">🕐 Newest</SelectItem>
                  <SelectItem value="oldest">🕑 Oldest</SelectItem>
                  <SelectItem value="unanswered">❓ Unanswered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40 h-12 border-2 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🔍 All Questions</SelectItem>
    
                  <SelectItem value="unanswered">❓ Unanswered</SelectItem>
                  <SelectItem value="answered">✅ Answered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 font-medium">
                {filteredQuestions.length} questions found
              </span>
            </div>
            
            <Link href='/add-question' className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-transparent hover:border-white/20">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="w-6 h-6 mr-3 transition-transform duration-300 group-hover:rotate-90" />
              <span className="relative z-10 text-lg">Ask New Question</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Enhanced Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((question) => {
            const questionAnswers = answers[question._id] || [];
            const hasAnswers = questionAnswers.length > 0;
            
            return (
              <Card key={question._id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Stats Sidebar */}
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-center space-y-4 min-w-[120px]">
                    
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                          <MessageCircle className={`w-4 h-4 ${hasAnswers ? 'text-green-600' : 'text-blue-600'}`} />
                          <span className={`font-bold text-2xl ${hasAnswers ? 'text-green-600' : 'text-blue-600'}`}>
                            {questionAnswers.length}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">answers</div>
                        {hasAnswers && (
                        <Check className="w-4 h-4 text-green-600 mx-auto mt-1" />
                      )}
                    </div>
                    
                    
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      {/* Wrap the title in a Link */}
                      <Link href={`/questions/${question._id}`} className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight">
                          {question.title}
                        </h3>
                      </Link>
                      {hasAnswers && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                            ✅ Answered
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {question.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags && question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer px-3 py-1 rounded-full">
                          <Hash className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {getUserInitials(question.author?.name)}
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-900">{question.author?.name || 'Anonymous'}</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                              <span>{getTimeAgo(question.createdAt)}</span>
                            </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50"
                            onClick={() => handleSummarize(question._id, question.description)}
                            disabled={loadingStates[`summarize-${question._id}`]}
                        >
                            {loadingStates[`summarize-${question._id}`] ? "⏳" : "📄"} Summarize
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-yellow-50"
                            onClick={() => handleAbuseCheck(question._id, question.title + " " + question.description)}
                            disabled={loadingStates[`abuse-${question._id}`]}
                        >
                            {loadingStates[`abuse-${question._id}`] ? "⏳" : "🛡"} Check Abuse
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-green-50"
                            onClick={() => handleFactCheck(question._id, question.description)}
                            disabled={loadingStates[`fact-${question._id}`]}
                        >
                            {loadingStates[`fact-${question._id}`] ? "⏳" : "✅"} Fact Check
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-purple-50"
                            onClick={() => handleImproveQuestion(question._id, question.title + " " + question.description)}
                            disabled={loadingStates[`improve-${question._id}`]}
                        >
                            {loadingStates[`improve-${question._id}`] ? "⏳" : "💡"} Improve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-indigo-50"
                            onClick={() => handleAskAI(question._id, question.title)}
                            disabled={loadingStates[`ask-${question._id}`]}
                        >
                            {loadingStates[`ask-${question._id}`] ? "⏳" : "🤖"} Ask AI
                        </Button>
                      </div>
                    </div>

                    {/* AI Response Cards */}
                    <div className="mt-4 space-y-3">
                        {summaries[question._id] && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600 font-semibold">📄 Summary</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                onClick={() => setSummaries(prev => ({ ...prev, [question._id]: null }))}
                              className="ml-auto h-6 w-6 p-0 hover:bg-blue-100"
                            >
                              ✕
                            </Button>
                          </div>
                            <p className="text-sm text-gray-700">{summaries[question._id]}</p>
                        </div>
                      )}

                        {abuseChecks[question._id] && (
                          <div className={`border rounded-lg p-4 ${abuseChecks[question._id] === 'GOOD' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                              <span className={`font-semibold ${abuseChecks[question._id] === 'GOOD' ? 'text-green-600' : 'text-red-600'}`}>
                                {abuseChecks[question._id] === 'GOOD' ? '✅ Clean Content' : '⚠ Flagged Content'}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                onClick={() => setAbuseChecks(prev => ({ ...prev, [question._id]: null }))}
                              className="ml-auto h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              ✕
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700">
                              This content has been analyzed and marked as {abuseChecks[question._id] === 'GOOD' ? 'safe' : 'potentially inappropriate'}.
                          </p>
                        </div>
                      )}

                        {factChecks[question._id] && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="text-yellow-700 font-semibold">�� Fact Check</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                onClick={() => setFactChecks(prev => ({ ...prev, [question._id]: null }))}
                              className="ml-auto h-6 w-6 p-0 hover:bg-yellow-100"
                            >
                              ✕
                            </Button>
                          </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{factChecks[question._id]}</p>
                        </div>
                      )}

                        {improvements[question._id] && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-purple-600 font-semibold">💡 Improvement Suggestions</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                onClick={() => setImprovements(prev => ({ ...prev, [question._id]: null }))}
                              className="ml-auto h-6 w-6 p-0 hover:bg-purple-100"
                            >
                              ✕
                            </Button>
                          </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{improvements[question._id]}</p>
                        </div>
                      )}

                        {aiAnswers[question._id] && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-indigo-600 font-semibold">🤖 AI Answer</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                                onClick={() => setAiAnswers(prev => ({ ...prev, [question._id]: null }))}
                              className="ml-auto h-6 w-6 p-0 hover:bg-indigo-100"
                            >
                              ✕
                            </Button>
                          </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiAnswers[question._id]}</p>
                          </div>
                        )}
                      </div>

                      {/* Answers Section */}
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            Answers ({questionAnswers.length})
                          </h4>
                          {currentUser && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              onClick={() => toggleAnswerForm(question._id)}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Add Answer
                            </Button>
                          )}
                        </div>
                        
                        {/* Answer Form */}
                        {answerForms[question._id] && currentUser && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                            <textarea
                              value={answerForms[question._id] || ''}
                              onChange={(e) => handleAnswerInputChange(question._id, e.target.value)}
                              placeholder="Write your answer here... (minimum 10 characters)"
                              rows={4}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                              maxLength={2000}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500">
                                {(answerForms[question._id] || '').length}/2000 characters
                              </span>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => toggleAnswerForm(question._id)}
                                  variant="outline"
                                  size="sm"
                                  className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => submitAnswer(question._id)}
                                  disabled={answerLoading[question._id]}
                                  className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                  {answerLoading[question._id] ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Submitting...</span>
                                    </>
                                  ) : (
                                    <span>Submit Answer</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                            {answerErrors[question._id] && (
                              <div className="mt-2 text-red-500 text-sm">
                                {answerErrors[question._id]}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {hasAnswers ? (
                          <div className="space-y-4">
                            {questionAnswers.map((answer) => (
                              <div key={answer._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {answer.owner?.name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {getTimeAgo(answer.createdAt)}
                                    </span>
                                  </div>
                                  {answer.accepted && (
                                    <Check className="h-5 w-5 text-green-600" />
                                  )}
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                  {answer.content}
                                </p>
                                
                                {/* Voting Section */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                  <div className="flex items-center space-x-4">
                                    {/* Upvote Button */}
                                    <button
                                      className="flex items-center space-x-1 text-gray-400 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                                      title={!currentUser ? "Please log in to vote" : answer.owner?._id === currentUser?._id ? "You cannot vote on your own answer" : "Upvote this answer"}
                                      disabled={!currentUser || answer.owner?._id === currentUser?._id}
                                    >
                                      <ArrowUp className="w-5 h-5" />
                                      <span className="text-sm">Upvote</span>
                                    </button>

                                    {/* Vote Count */}
                                    <span className={`text-lg font-bold ${(answer.votes || 0) > 0 ? 'text-green-500' : (answer.votes || 0) < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                      {answer.votes || 0}
                                    </span>

                                    {/* Downvote Button */}
                                    <button
                                      className="flex items-center space-x-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                                      title={!currentUser ? "Please log in to vote" : answer.owner?._id === currentUser?._id ? "You cannot vote on your own answer" : "Downvote this answer"}
                                      disabled={!currentUser || answer.owner?._id === currentUser?._id}
                                    >
                                      <ArrowDown className="w-5 h-5" />
                                      <span className="text-sm">Downvote</span>
                                    </button>
                                  </div>

                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500 text-sm italic">No answers yet</p>
                            <p className="text-gray-600 text-xs mt-1">
                              {currentUser ? "Be the first to answer this question!" : "Log in to be the first to answer this question!"}
                            </p>
                            {currentUser && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                onClick={() => toggleAnswerForm(question._id)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Add Answer
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* No Questions Message */}
        {filteredQuestions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No questions found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
            </p>
          </div>
        )}

        {/* Add API Status Indicator */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Edith AI Ready</span>
            </div>
            </div>
          </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>
          <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button 
                    key={page} 
                    variant={page === pagination.currentPage ? "default" : "outline"} 
                    size="sm" 
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(page)}
                  >
                {page}
              </Button>
                );
              })}
          </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        )}
      </main>
    </div>
  )
}