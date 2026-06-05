import { Copy, Forward, ImageUp, SmilePlus, Trash2 } from 'lucide-react';
import { LinkPreview } from '@/components/entradas/link-preview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LocalMessage } from '@/types';
import { renderMessageText } from '@/utils/message';

function formatDatetime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
        return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }

    if (days === 1) {
        return 'Ayer';
    }

    if (days < 7) {
        return d.toLocaleDateString('es-PE', { weekday: 'short' });
    }

    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

interface ChatMessageBubbleProps {
    msg: LocalMessage;
    isMe: boolean;
    isGroup: boolean;
    reaction: string | undefined;
    msgSearch: string;
    onLightbox: (url: string) => void;
    onReact: (msg: LocalMessage, e: React.MouseEvent) => void;
    onForward: (msg: LocalMessage) => void;
    onCopy: (msg: LocalMessage) => void;
    onDelete: (msg: LocalMessage) => void;
    onGeneratePreview?: (msg: LocalMessage) => void;
}

export function ChatMessageBubble({
    msg,
    isMe,
    isGroup,
    reaction,
    msgSearch,
    onLightbox,
    onReact,
    onForward,
    onCopy,
    onDelete,
    onGeneratePreview,
}: ChatMessageBubbleProps) {
    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className="min-w-0 max-w-[75%]">
                {msgSearch && msg.text && msg.text.toLowerCase().includes(msgSearch.toLowerCase()) && (
                    <div className="mb-1 text-xs font-medium text-primary">
                        {(() => {
                            const idx = msg.text!.toLowerCase().indexOf(msgSearch.toLowerCase());
                            const before = msg.text!.substring(0, idx);
                            const after = msg.text!.substring(idx + msgSearch.length);
                            const snippet = (before.length > 30 ? '...' : '') + before.substring(Math.max(0, before.length - 30)) + after.substring(0, 60) + (after.length > 60 ? '...' : '');

                            return `Coincidencia en: "${snippet}"`;
                        })()}
                    </div>
                )}
                {isGroup && (
                    <div className="mb-1 flex items-start gap-1.5">
                        <Avatar className="mt-0.5 size-5">
                            <AvatarImage src={msg.sender_avatar ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                                {(msg.sender_name ?? msg.sender_phone ?? '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                            <p className="truncate text-sm font-medium text-foreground">
                                {msg.sender_name || msg.sender_phone || 'Desconocido'}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                                {msg.sender_phone ?? ''}@s.whatsapp.net
                            </p>
                        </div>
                    </div>
                )}
                <div className="relative rounded-2xl bg-muted px-4 py-2 text-sm">
                    {msg.media_url && msg.message_type === 'audioMessage' ? (
                        <audio src={msg.media_url} controls className="h-10 w-48" />
                    ) : msg.media_url && (msg.message_type === 'imageMessage' || msg.message_type === 'stickerMessage') ? (
                        <img
                            src={msg.media_url}
                            alt=""
                            className="max-h-36 max-w-56 rounded-lg object-contain cursor-pointer hover:opacity-80"
                            loading="lazy"
                            onClick={() => onLightbox(msg.media_url!)}
                        />
                    ) : msg.media_url && msg.message_type === 'videoMessage' ? (
                        <video
                            src={msg.media_url}
                            controls
                            className="max-h-36 max-w-56 rounded-lg cursor-pointer hover:opacity-80"
                            onClick={() => onLightbox(msg.media_url!)}
                        />
                    ) : msg.media_url && msg.media_url.endsWith('.pdf') ? (
                        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onLightbox(msg.media_url!)}>
                            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                                <span className="truncate text-sm font-medium">
                                    {msg.text || 'Ver PDF'}
                                </span>
                            </div>
                            {msg.text && (
                                <p className="whitespace-pre-wrap break-all text-xs">
                                    {renderMessageText(msg.text)}
                                </p>
                            )}
                        </div>
                    ) : msg.media_url ? (
                        <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="underline">
                            📎 {msg.text || 'Ver archivo'}
                        </a>
                    ) : null}
                    {msg.text && !msg.media_url?.endsWith('.pdf') && (
                        <p className="whitespace-pre-wrap break-all">
                            {renderMessageText(msg.text)}
                        </p>
                    )}
                    {msg.text && !msg.media_url && (
                        <LinkPreview savedPreview={msg.link_preview} />
                    )}
                    <div className="mt-1 flex items-center justify-end gap-1 text-right text-[11px] text-muted-foreground">
                        <span>{formatDatetime(msg.created_at)}</span>
                        <span className="text-muted-foreground/40">#{msg.id}</span>
                        {msg.message_id && (
                            <>
                                {onGeneratePreview && msg.text && /https?:\/\/[^\s<]+/.test(msg.text) && (
                                    <button
                                        type="button"
                                        className="flex size-5 items-center justify-center rounded hover:bg-muted-foreground/20"
                                        onClick={() => onGeneratePreview(msg)}
                                        title="Generar preview"
                                    >
                                        <ImageUp className="size-3.5" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="flex size-5 items-center justify-center rounded hover:bg-muted-foreground/20"
                                    onClick={(e) => onReact(msg, e)}
                                    title="Reaccionar"
                                >
                                    {reaction ? (
                                        <span className="text-xs">{reaction}</span>
                                    ) : (
                                        <SmilePlus className="size-3.5" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="flex size-5 items-center justify-center rounded hover:bg-muted-foreground/20"
                                    onClick={() => onForward(msg)}
                                    title="Reenviar"
                                >
                                    <Forward className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    className="flex size-5 items-center justify-center rounded hover:bg-muted-foreground/20"
                                    onClick={() => onCopy(msg)}
                                    title="Copiar texto"
                                >
                                    <Copy className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    className="flex size-5 items-center justify-center rounded hover:bg-red-200/30"
                                    onClick={() => onDelete(msg)}
                                    title="Eliminar"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </>
                        )}
                        {isMe && msg.status && (
                            <span className="inline-flex items-center">
                                {msg.status === 'pending' && <span className="text-muted-foreground/50">⌛</span>}
                                {msg.status === 'sent' && <span className="text-muted-foreground">✓</span>}
                                {msg.status === 'delivered' && <span className="text-muted-foreground">✓✓</span>}
                                {msg.status === 'read' && <span className="text-blue-500">✓✓</span>}
                                {msg.status === 'failed' && <span className="text-red-500">✗</span>}
                            </span>
                        )}
                    </div>
                </div>
                {reaction && msg.message_id && (
                    <div className={cn(
                        'relative z-10 -mt-2 flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs shadow-xs',
                        isMe ? 'mr-3 justify-end' : 'ml-3 justify-start',
                    )}>
                        <span>{reaction}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
