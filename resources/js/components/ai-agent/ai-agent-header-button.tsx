import { BotMessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { AiAgentChatPanel } from '@/components/ai-agent/ai-agent-chat-panel';
import { Button } from '@/components/ui/button';

export function AiAgentHeaderButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => setOpen(true)}
                title="AI Agent"
            >
                <BotMessageSquare className="size-4" />
            </Button>
            <AiAgentChatPanel open={open} onOpenChange={setOpen} />
        </>
    );
}
