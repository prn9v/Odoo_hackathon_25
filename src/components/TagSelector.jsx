'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

const suggestedTags = [
  'React', 'Next.js', 'JavaScript', 'Node.js', 'Python', 'CSS', 'HTML', 'JWT',
  'Authentication', 'API', 'Database', 'MongoDB', 'PostgreSQL', 'Express',
  'Vue.js', 'Angular', 'Tailwind CSS', 'Redux', 'GraphQL', 'REST',
  'Git', 'Docker', 'AWS', 'Firebase', 'Supabase'
];

export default function TagSelector({ selectedTags, onTagsChange, maxTags = 5 }) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestedTags.filter(tag =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, selectedTags]);

  const addTag = (tag) => {
    if (tag.trim() && !selectedTags.includes(tag.trim()) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag.trim()]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedTags.length < maxTags
              ? 'Type to search or add tags...'
              : `Maximum ${maxTags} tags reached`
          }
          disabled={selectedTags.length >= maxTags}
          className="pr-10"
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => addTag(inputValue)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between"
                onClick={() => addTag(tag)}
              >
                <span>{tag}</span>
                <Plus className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Tags */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Popular tags:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTags
            .slice(0, 8)
            .filter(tag => !selectedTags.includes(tag))
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                onClick={() => addTag(tag)}
              >
                <Plus className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {selectedTags.length}/{maxTags} tags selected. Press Enter or comma to add a tag.
      </p>
    </div>
  );
}
