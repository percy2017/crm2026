import { BotMessageSquare, X } from 'lucide-react'
import { useState } from 'react'
import { AiAgentChatPanel } from '@/components/ai-agent/ai-agent-chat-panel'
import { cn } from '@/lib/utils'

export function AiAgentFloatingButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-28 right-6 z-40 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95',
          'bg-neutral-800 text-white hover:bg-neutral-700',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2',
          open && 'hidden',
        )}
        aria-label="Abrir AI Agent"
      >
        <BotMessageSquare className="size-7" />
      </button>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className={cn(
          'fixed bottom-28 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
          'bg-neutral-800 text-white hover:bg-neutral-700',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2',
          !open && 'hidden',
        )}
        aria-label="Cerrar AI Agent"
      >
        <X className="size-7" />
      </button>

      <AiAgentChatPanel open={open} onOpenChange={setOpen} />
    </>
  )
}
