'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  MessageCircle, 
  Eye, 
  CheckCircle, 
  Bookmark,
  Share2 
} from 'lucide-react';

export default function QuestionCard({ question }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Vote and Stats Section */}
          <div className="flex flex-col items-center space-y-2 text-center min-w-[60px]">
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-gray-700">{question.votes}</span>
              <span className="text-xs text-gray-500">votes</span>
            </div>
            
            <div className="flex flex-col items-center space-y-1">
              <div className={`flex items-center space-x-1 ${
                question.acceptedAnswer ? 'text-green-600' : 'text-gray-500'
              }`}>
                {question.acceptedAnswer && <CheckCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{question.answers}</span>
              </div>
              <span className="text-xs text-gray-500">
                {question.answers === 1 ? 'answer' : 'answers'}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500">{question.views}</span>
              <span className="text-xs text-gray-500">views</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <Link 
                href={`/questions/${question.id}`}
                className="block group flex-1"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                  {question.title}
                </h3>
              </Link>
              
              <div className="flex items-center space-x-1 ml-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {question.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs hover:bg-blue-100 cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{question.answers} answers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.views} views</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">asked {question.createdAt} by</span>
                <Link 
                  href={`/users/${question.author}`}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded p-1 transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={question.authorAvatar} alt={question.author} />
                    <AvatarFallback>{question.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    {question.author}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
