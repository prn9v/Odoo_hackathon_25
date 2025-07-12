'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationDropdown from '@/components/NotificationDropdown';

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [user, setUser] = useState(null);
  const [answerForms, setAnswerForms] = useState({});
  const [answerLoading, setAnswerLoading] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});
  const [voteLoading, setVoteLoading] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchQuestions();
  }, [currentPage, searchTerm, sortBy]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        sort: sortBy
      });

      const response = await fetch(`/api/questions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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

      // Fetch answers for each question
      for (const question of questionsData) {
        const params = new URLSearchParams({
          questionId: question._id,
          limit: 50, // Get more answers per question
          sort: 'newest'
        });

        const response = await fetch(`/api/answer?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions();
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other potential stored data
    sessionStorage.clear();
    
    // Show logout message
    setSuccess('Logged out successfully! Redirecting to login...');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 1500);
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

  const getVoteColor = (votes) => {
    if (votes > 0) return 'text-green-500';
    if (votes < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const handleVote = async (answerId, direction, questionId) => {
    try {
      setVoteLoading(prev => ({ ...prev, [answerId]: true }));
      const token = localStorage.getItem('token');

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answerId,
          direction,
          questionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the answer's vote count in the local state
        setAnswers(prev => {
          const newAnswers = { ...prev };
          Object.keys(newAnswers).forEach(qId => {
            newAnswers[qId] = newAnswers[qId].map(answer => {
              if (answer._id === answerId) {
                return { ...answer, votes: data.newVoteCount };
              }
              return answer;
            });
          });
          return newAnswers;
        });
      } else {
        // Show error message
        setError(data.message || 'Failed to vote');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error voting:', error);
      setError('Network error. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setVoteLoading(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const toggleAnswerForm = (questionId) => {
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

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-blue-400">Q&A Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <NotificationDropdown />
              <button
                onClick={() => router.push('/add-question')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Ask Question
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="mostVoted">Most Voted</option>
              <option value="unanswered">Unanswered</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-white font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question) => {
            const questionAnswers = answers[question._id] || [];
            const hasAnswers = questionAnswers.length > 0;
            
            return (
              <div key={question._id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 cursor-pointer">
                      {question.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>By {question.author?.name || 'Anonymous'}</span>
                      <span>{formatDate(question.createdAt)}</span>
                      <span className={`font-medium ${getVoteColor(question.votes)}`}>
                        {question.votes || 0} votes
                      </span>
                      <span className="text-gray-400">{question.views || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {question.isClosed && (
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                        Closed
                      </span>
                    )}
                    {question.acceptedAnswer && (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        Answered
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Description */}
                <div className="mb-4">
                  <p className="text-gray-300 leading-relaxed">
                    {question.description && question.description.length > 200 
                      ? `${question.description.substring(0, 200)}...` 
                      : question.description
                    }
                  </p>
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Answers Section */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-white">
                      Answers ({questionAnswers.length})
                    </h3>
                    {!question.isClosed && (
                      <button
                        onClick={() => toggleAnswerForm(question._id)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        {answerForms[question._id] ? 'Cancel' : 'Add Answer'}
                      </button>
                    )}
                  </div>

                  {/* Answer Form */}
                  {answerForms[question._id] && !question.isClosed && (
                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                      <textarea
                        value={answerForms[question._id] || ''}
                        onChange={(e) => handleAnswerInputChange(question._id, e.target.value)}
                        placeholder="Write your answer here... (minimum 10 characters)"
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                        maxLength={2000}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {(answerForms[question._id] || '').length}/2000 characters
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleAnswerForm(question._id)}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitAnswer(question._id)}
                            disabled={answerLoading[question._id]}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            {answerLoading[question._id] ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <span>Submit Answer</span>
                            )}
                          </button>
                        </div>
                      </div>
                      {answerErrors[question._id] && (
                        <div className="mt-2 text-red-400 text-sm">
                          {answerErrors[question._id]}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Display Answers */}
                  {hasAnswers ? (
                    <div className="space-y-4">
                      {questionAnswers.map((answer) => (
                        <div key={answer._id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-300">
                                {answer.owner?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(answer.createdAt)}
                              </span>
                              {answer.owner?.role && (
                                <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                                  {answer.owner.role}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {answer.accepted && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  ✓ Accepted
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {answer.content}
                            </p>
                          </div>
                          
                          {/* Voting Section */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-600">
                            <div className="flex items-center space-x-4">
                              {/* Upvote Button */}
                              <button
                                onClick={() => handleVote(answer._id, 'up', question._id)}
                                disabled={voteLoading[answer._id] || answer.owner?._id === user?._id}
                                className="flex items-center space-x-1 text-gray-400 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                                title={answer.owner?._id === user?._id ? "You cannot vote on your own answer" : "Upvote this answer"}
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Upvote</span>
                              </button>

                              {/* Vote Count */}
                              <span className={`text-lg font-bold ${getVoteColor(answer.votes)}`}>
                                {answer.votes || 0}
                              </span>

                              {/* Downvote Button */}
                              <button
                                onClick={() => handleVote(answer._id, 'down', question._id)}
                                disabled={voteLoading[answer._id] || answer.owner?._id === user?._id}
                                className="flex items-center space-x-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                                title={answer.owner?._id === user?._id ? "You cannot vote on your own answer" : "Downvote this answer"}
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Downvote</span>
                              </button>
                            </div>

                            {/* Loading indicator */}
                            {voteLoading[answer._id] && (
                              <div className="flex items-center space-x-2">
                                <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xs text-gray-400">Voting...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm italic">No answers yet</p>
                      <p className="text-gray-600 text-xs mt-1">Be the first to answer this question!</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Previous
            </button>
            
            <span className="text-gray-300">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        )}

        {/* No Questions Message */}
        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No questions found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/add-question')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-white font-medium"
              >
                Ask Your First Question
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
