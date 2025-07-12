"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

export function RichTextEditor({ value, onChange, placeholder }) {
  const [showToolbar, setShowToolbar] = useState(true)

  const insertText = (before, after = "") => {
    const textarea = document.querySelector("textarea")
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, action: () => insertText("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertText("*", "*"), title: "Italic" },
    { icon: Strikethrough, action: () => insertText("~~", "~~"), title: "Strikethrough" },
    { icon: List, action: () => insertText("\n- ", ""), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertText("\n1. ", ""), title: "Numbered List" },
    { icon: Link, action: () => insertText("[", "](url)"), title: "Link" },
    { icon: ImageIcon, action: () => insertText("![alt text](", ")"), title: "Image" },
    { icon: Smile, action: () => insertText("😊", ""), title: "Emoji" },
    { icon: AlignLeft, action: () => insertText('\n<div align="left">', "</div>"), title: "Align Left" },
    { icon: AlignCenter, action: () => insertText('\n<div align="center">', "</div>"), title: "Align Center" },
    { icon: AlignRight, action: () => insertText('\n<div align="right">', "</div>"), title: "Align Right" },
  ]

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      {showToolbar && (
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.title}
              className="w-8 h-8 p-0"
            >
              <button.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      )}

      {/* Text Area */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] border-0 resize-none focus-visible:ring-0 rounded-none"
        onFocus={() => setShowToolbar(true)}
      />
    </div>
  )
}
