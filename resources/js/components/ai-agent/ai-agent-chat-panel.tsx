import { usePage } from '@inertiajs/react'
import { BotMessageSquare, SendHorizonal, Bot, Sparkles, Paperclip, Mic, X } from 'lucide-react'
import {  useEffect, useRef, useState } from 'react'
import type {FormEvent} from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ChatResponse = {
  message: string
}

function getCsrfToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
}

async function uploadToMedios(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/admin/media/upload', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
    },
    body: formData,
  })

  if (!res.ok) {
throw new Error('Upload failed')
}

  const data = await res.json()

  return data.filename
}

function detectMediaType(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
return 'image'
}

  if (mimetype.startsWith('video/')) {
return 'video'
}

  if (mimetype.startsWith('audio/')) {
return 'audio'
}

  return 'document'
}

export function AiAgentChatPanel({ open, onOpenChange }: Props) {
  const { url, component } = usePage()
  const pageContext = { url, component }

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [pickedFile, setPickedFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!input.trim() || isLoading) {
return
}

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    const text = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/admin/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          message: text,
          page_context: pageContext,
        }),
      })

      if (!res.ok) {
throw new Error('Chat failed')
}

      const data: ChatResponse = await res.json()

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: data.message },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Error al conectar con el agente. Intenta de nuevo.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) {
return
}

    setPickedFile(file)
    e.target.value = ''
  }

  async function handleSendFile() {
    if (!pickedFile) {
return
}

    setUploading(true)

    try {
      const filename = await uploadToMedios(pickedFile)
      const mediaType = detectMediaType(pickedFile.type)

      const text = input.trim()
        ? `[${mediaType}] ${input.trim()}`
        : `[${mediaType}] ${pickedFile.name}`

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: text },
      ])
      setInput('')
      setPickedFile(null)
      setIsLoading(true)

      const res = await fetch('/admin/ai-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          message: text,
          page_context: pageContext,
        }),
      })

      if (res.ok) {
        const data: ChatResponse = await res.json()
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: data.message },
        ])
      }
    } catch {
      // ignore
    } finally {
      setUploading(false)
      setIsLoading(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())

        if (audioChunksRef.current.length === 0) {
return
}

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' })

        setUploading(true)

        try {
          const filename = await uploadToMedios(file)
          const text = `[audio] Mensaje de voz`

          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'user', content: text },
          ])
          setIsLoading(true)

          const res = await fetch('/admin/ai-agent/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-CSRF-TOKEN': getCsrfToken(),
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
              message: text,
              page_context: pageContext,
            }),
          })

          if (res.ok) {
            const data: ChatResponse = await res.json()
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: 'assistant', content: data.message },
            ])
          }
        } catch {
          // ignore
        } finally {
          setUploading(false)
          setIsLoading(false)
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      // ignore
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  function toggleRecording() {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col p-0 sm:max-w-lg"
      >
        <SheetHeader className="sticky top-0 z-10 border-b bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-neutral-800 text-white">
                <BotMessageSquare className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base">AI Agent</SheetTitle>
                <SheetDescription className="text-xs">
                  Asistente inteligente del CRM
                </SheetDescription>
              </div>
            </div>
        </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-neutral-500">
                    <BotMessageSquare className="size-10" />
                    <p>Pregúntame sobre contactos, órdenes, productos o lo que necesites.</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                        <Bot className="size-4" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="markdown-content [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:ml-4 [&_code]:rounded [&_code]:bg-neutral-200 [&_code]:px-1 [&_code]:text-xs dark:[&_code]:bg-neutral-700 [&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-200 [&_pre]:p-2 [&_pre]:text-xs dark:[&_pre]:bg-neutral-700 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-600 dark:[&_blockquote]:text-neutral-400 [&_a]:underline [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_table]:mb-2 [&_table]:w-full [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1 [&_th]:text-left [&_hr]:my-3 [&_hr]:border-neutral-300 dark:[&_hr]:border-neutral-600">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                        <Sparkles className="size-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                      <Bot className="size-4" />
                    </div>
                    <div className="flex items-center gap-1 rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                      <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '150ms' }} />
                      <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="sticky bottom-0 border-t bg-card px-4 py-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                className="hidden"
                onChange={handleFilePicked}
              />

              {pickedFile ? (
                <div className="flex items-center gap-2 rounded-lg border bg-neutral-50 p-2 dark:bg-neutral-900">
                  <span className="min-w-0 flex-1 truncate text-sm">{pickedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => setPickedFile(null)}
                    disabled={uploading}
                  >
                    <X className="size-3.5" />
                  </Button>
                  <Button size="sm" onClick={handleSendFile} disabled={uploading}>
                    {uploading ? 'Subiendo...' : 'Enviar'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-10 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || uploading || recording}
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className={cn(
                      'size-10 shrink-0',
                      recording && 'animate-pulse text-red-500',
                    )}
                    onClick={toggleRecording}
                    disabled={isLoading || uploading}
                  >
                    <Mic className="size-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder={
                        recording ? 'Grabando...' : 'Escribe tu mensaje...'
                      }
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[40px] resize-none"
                      disabled={isLoading || uploading || recording}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading || uploading || recording}
                    className="size-10 shrink-0"
                  >
                    <SendHorizonal className="size-4" />
                  </Button>
                </div>
              )}
            </form>
      </SheetContent>
    </Sheet>
  )
}
