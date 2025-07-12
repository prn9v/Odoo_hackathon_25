"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Quote,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const emojis = ["😀", "😂", "😍", "🤔", "👍", "👎", "❤", "🔥", "💯", "🎉", "🚀", "💡", "⚡", "✨", "🎯", "📝"]

export function RichTextEditor({ value, onChange, placeholder }) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const textareaRef = useRef(null)

  const insertText = (before, after = "", placeholder = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    onChange(newValue)

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }


  const insertEmoji = (emoji) => {
    insertText(emoji)
  }

  return (
    <div className="border border-slate-200 rounded-md bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("", "", "bold text")}
          className="h-8 w-8 p-0"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("", "", "italic text")}
          className="h-8 w-8 p-0"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("", "", "strikethrough text")}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("", "", "code")}
          className="h-8 w-8 p-0"
        >
          <Code className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("> ", "", "quote")}
          className="h-8 w-8 p-0"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("- ", "", "list item")}
          className="h-8 w-8 p-0"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("1. ", "", "list item")}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <LinkIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-text">Link Text (optional)</Label>
                <Input
                  id="link-text"
                  placeholder="Link description"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("![alt text](", ")", "image-url")}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Smile className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertEmoji(emoji)}
                  className="h-8 w-8 p-0 text-lg"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('<div style="text-align: left;">', "</div>", "left aligned text")}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('<div style="text-align: center;">', "</div>", "centered text")}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('<div style="text-align: right;">', "</div>", "right aligned text")}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] border-0 resize-none focus-visible:ring-0 rounded-t-none"
      />
    </div>
  )
}