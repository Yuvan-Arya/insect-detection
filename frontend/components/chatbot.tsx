"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, X, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MothIcon } from "./moth-icon"
import { chatResponses } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const suggestedQuestions = [
  "What does a high moth count mean?",
  "Is the Luna Moth an invasive species?",
  "What plants attract Green Lacewings?",
  "Why are fireflies an ecological indicator?",
  "How does the Entolux box identify species?",
]

function getResponse(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes("moth") && (lowerQuery.includes("count") || lowerQuery.includes("high") || lowerQuery.includes("many"))) {
    return chatResponses["moth count"]
  }
  if (lowerQuery.includes("luna") && lowerQuery.includes("invasive")) {
    return chatResponses["luna moth invasive"]
  }
  if (lowerQuery.includes("lacewing") && lowerQuery.includes("plant")) {
    return chatResponses["green lacewing plants"]
  }
  if (lowerQuery.includes("firefl")) {
    return chatResponses["fireflies"]
  }
  if (lowerQuery.includes("identify") || lowerQuery.includes("how") && (lowerQuery.includes("entolux") || lowerQuery.includes("work"))) {
    return chatResponses["how entolux identifies"]
  }
  
  return chatResponses["default"]
}

interface ChatbotProviderProps {
  children: React.ReactNode
}

interface ChatbotContextType {
  isOpen: boolean
  open: (query?: string) => void
  close: () => void
  toggle: () => void
}

import { createContext, useContext } from "react"

const ChatbotContext = createContext<ChatbotContextType | null>(null)

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingQuery, setPendingQuery] = useState<string | undefined>()

  const open = useCallback((query?: string) => {
    if (query) {
      setPendingQuery(query)
    }
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <ChatbotContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      <ChatbotPanel 
        isOpen={isOpen} 
        onClose={close} 
        pendingQuery={pendingQuery}
        onQueryConsumed={() => setPendingQuery(undefined)}
      />
      <ChatbotToggleButton isOpen={isOpen} onClick={toggle} />
    </ChatbotContext.Provider>
  )
}

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
  pendingQuery?: string
  onQueryConsumed: () => void
}

function ChatbotPanel({ isOpen, onClose, pendingQuery, onQueryConsumed }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (pendingQuery && isOpen) {
      setInput(pendingQuery)
      onQueryConsumed()
    }
  }, [pendingQuery, isOpen, onQueryConsumed])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const newAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, newAssistantMessage])

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chat_context: messageText }),
      })

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`)
      }

      setIsTyping(false)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        }
      }
    } catch (err: any) {
      console.error(err)
      setIsTyping(false)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Sorry, I had trouble connecting to the chat server." }
            : msg
        )
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-280 ease-out",
        "bottom-24 right-6 w-[340px] h-[480px]",
        "max-md:w-[calc(100vw-32px)] max-md:right-4 max-md:bottom-[88px] max-md:h-[60vh]",
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-5 pointer-events-none"
      )}
    >
      <div className="w-full h-full bg-[#EDE5D8] border border-[#D4C5B0] rounded-2xl shadow-[0_8px_32px_rgba(44,31,14,0.15)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-[52px] bg-[#228B22] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MothIcon className="h-5 w-5 text-[#F5F0E8] flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[#F5F0E8] text-sm">Entolux AI</span>
              <span className="text-xs text-[#F5F0E8]/80 truncate">Ask about your captures</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-[#F5F0E8]" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col gap-2 py-4">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSend(question)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm bg-[#D6CBBA] text-[#2C1F0E] hover:bg-[#228B22] hover:text-[#F5F0E8] transition-colors duration-150"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-[#228B22] text-[#F5F0E8] rounded-xl rounded-br-sm"
                    : "bg-[#F5F0E8] text-[#2C1F0E] border border-[#D4C5B0] rounded-xl rounded-bl-sm"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#F5F0E8] text-[#2C1F0E] border border-[#D4C5B0] rounded-xl rounded-bl-sm px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2C1F0E]/50 animate-[pulse_1s_ease-in-out_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-[#2C1F0E]/50 animate-[pulse_1s_ease-in-out_infinite_0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#2C1F0E]/50 animate-[pulse_1s_ease-in-out_infinite_0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-2 border-t border-[#D4C5B0] flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-[#F5F0E8] border-[#D4C5B0] text-[#2C1F0E] placeholder:text-[#2C1F0E]/50 focus-visible:ring-[#228B22]"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-[#228B22] text-[#F5F0E8] hover:bg-[#1a6b1a] flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ChatbotToggleButtonProps {
  isOpen: boolean
  onClick: () => void
}

function ChatbotToggleButton({ isOpen, onClick }: ChatbotToggleButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Label pill - visible on hover when closed */}
      <div
        className={cn(
          "px-3 py-1.5 rounded-full bg-[#EDE5D8] text-[#2C1F0E] text-sm font-medium transition-opacity duration-150",
          isHovered && !isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        Entolux AI
      </div>
      
      {/* Toggle button */}
      <button
        onClick={onClick}
        className={cn(
          "h-14 w-14 rounded-full bg-[#228B22] flex items-center justify-center transition-all duration-150",
          "shadow-[0_4px_16px_rgba(34,139,34,0.30)]",
          "hover:scale-105 hover:bg-[#1a6b1a]"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-[#F5F0E8]" />
        ) : (
          <Bug className="h-6 w-6 text-[#F5F0E8]" />
        )}
      </button>
    </div>
  )
}

// Hook for capture cards to trigger chatbot with a query
export function useAskAbout() {
  const { open } = useChatbot()
  
  return useCallback((speciesName: string) => {
    open(`Tell me about ${speciesName}`)
  }, [open])
}
