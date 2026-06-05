import { FileText, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

type QuickReply = {
    id: number;
    shortcut: string;
    message: string | null;
    media_url: string | null;
    media_type: string | null;
};

export function QuickReplyDropdown({
    query,
    onSelect,
    onClose,
}: {
    query: string;
    onSelect: (reply: QuickReply) => void;
    onClose: () => void;
}) {
    const [replies, setReplies] = useState<QuickReply[]>([]);
    const [filtered, setFiltered] = useState<QuickReply[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/admin/quick-replies/list', {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json() as Promise<QuickReply[]>)
            .then(setReplies)
            .catch(() => {});
    }, []);

    useEffect(() => {
        const q = query.toLowerCase();
        const f = replies.filter(
            (r) => r.shortcut.toLowerCase().includes(q) || (r.message ?? '').toLowerCase().includes(q),
        );
        setFiltered(f);
        setSelectedIndex(0);
    }, [query, replies]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && filtered[selectedIndex]) {
                e.preventDefault();
                onSelect(filtered[selectedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown as EventListener);

        return () => window.removeEventListener('keydown', handleKeyDown as EventListener);
    }, [filtered, selectedIndex, onSelect, onClose]);

    useEffect(() => {
        const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (filtered.length === 0) {
        return null;
    }

    return (
        <div
            className="absolute bottom-full left-0 right-0 z-50 mb-1 max-h-48 overflow-y-auto rounded-lg border bg-background shadow-lg"
            ref={listRef}
        >
            {filtered.map((reply, i) => (
                <button
                    key={reply.id}
                    type="button"
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                        i === selectedIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => onSelect(reply)}
                    onMouseEnter={() => setSelectedIndex(i)}
                >
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Zap className="size-3.5 text-amber-500" />
                        <code className="rounded bg-muted px-1 text-xs">{reply.shortcut}</code>
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                        {reply.message ?? 'Sin texto'}
                        {reply.media_url && (
                            <Badge variant="outline" className="ml-2 inline-flex items-center gap-0.5 py-0 text-[10px]">
                                <FileText className="size-2.5" />
                                {reply.media_type ?? 'file'}
                            </Badge>
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
}