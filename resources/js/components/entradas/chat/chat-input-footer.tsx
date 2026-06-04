import { useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { Mic, Paperclip, Send, Smile, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickReplyDropdown } from '@/components/entradas/quick-reply-dropdown';
import { LinkPreview, extractUrls } from '@/components/entradas/link-preview';
import type { LocalConversation } from '@/types';

interface ChatInputFooterProps {
    input: string;
    setInput: (val: string) => void;
    sending: boolean;
    uploading: boolean;
    recording: boolean;
    selectedConv: LocalConversation | null;
    quickReplyQuery: string | null;
    setQuickReplyQuery: (val: string | null) => void;
    aiGenerating: boolean;
    pickedFile: File | null;
    setPickedFile: (val: File | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    showEmojiPicker: boolean;
    setShowEmojiPicker: (val: boolean | ((prev: boolean) => boolean)) => void;
    onSendText: () => void;
    onSendFile: () => void;
    onAiReply: () => void;
    onToggleRecording: () => void;
    onQuickReplySelect: (reply: { shortcut: string; message: string | null; media_url: string | null; media_type: string | null }) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatInputFooter({
    input,
    setInput,
    sending,
    uploading,
    recording,
    selectedConv,
    quickReplyQuery,
    setQuickReplyQuery,
    aiGenerating,
    pickedFile,
    setPickedFile,
    fileInputRef,
    showEmojiPicker,
    setShowEmojiPicker,
    onSendText,
    onSendFile,
    onAiReply,
    onToggleRecording,
    onQuickReplySelect,
    onKeyDown,
}: ChatInputFooterProps) {
    function handleEmojiClick(emoji: EmojiClickData) {
        setInput(input + emoji.emoji);
        setShowEmojiPicker(false);
    }

    return (
        <div className="border-t p-3 space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && selectedConv) {
                        setPickedFile(file);
                    }
                    e.target.value = '';
                }}
            />

            {pickedFile && (
                <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-2">
                    <div className="flex items-center gap-2">
                        {pickedFile.type.startsWith('image/') && (
                            <img
                                src={URL.createObjectURL(pickedFile)}
                                alt="preview"
                                className="size-10 shrink-0 rounded object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        )}
                        {pickedFile.type.startsWith('video/') && (
                            <video
                                src={URL.createObjectURL(pickedFile)}
                                className="size-10 shrink-0 rounded object-cover"
                                muted
                            />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm">
                            {pickedFile.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            onClick={() => setPickedFile(null)}
                            disabled={uploading}
                        >
                            <X className="size-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={onSendFile}
                            disabled={uploading}
                        >
                            {uploading ? 'Subiendo...' : 'Enviar'}
                        </Button>
                    </div>
                    <textarea
                        placeholder="Añade un caption..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSendFile();
                            }
                        }}
                        onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                        }}
                        className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[32px] max-h-24 entrada-textarea"
                        rows={1}
                        disabled={uploading}
                    />
                </div>
            )}

            {/* Row 1: textarea */}
            <div className="relative">
                {quickReplyQuery !== null && (
                    <QuickReplyDropdown
                        query={quickReplyQuery}
                        onSelect={onQuickReplySelect}
                        onClose={() => setQuickReplyQuery(null)}
                    />
                )}
                <textarea
                    placeholder={recording ? 'Grabando...' : 'Escribe un mensaje...'}
                    value={input}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInput(val);

                        if (val.startsWith('/')) {
                            const query = val.slice(1);
                            setQuickReplyQuery(query.length > 0 ? query : '');
                        } else {
                            setQuickReplyQuery(null);
                        }
                    }}
                    onKeyDown={onKeyDown}
                    onPaste={(e) => {
                        const items = e.clipboardData?.items;
                        if (!items) return;

                        for (const item of items) {
                            if (item.type.startsWith('image/') || item.type.startsWith('video/') || item.type.startsWith('audio/')) {
                                e.preventDefault();
                                const file = item.getAsFile();
                                if (file && selectedConv) {
                                    setPickedFile(file);
                                }
                                return;
                            }
                        }
                    }}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                    }}
                    className="flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[42px] max-h-32 entrada-textarea"
                    rows={1}
                    disabled={sending || uploading || recording}
                />
                {input && !quickReplyQuery && extractUrls(input).length > 0 && (
                    <div className="mt-2">
                        <LinkPreview text={input} />
                    </div>
                )}
            </div>

            {/* Row 2: action bar */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || uploading || recording}
                    title="Adjuntar archivo"
                >
                    <Paperclip className="size-4" />
                </button>
                <button
                    type="button"
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40 ${recording ? 'animate-pulse text-red-500' : ''}`}
                    onClick={onToggleRecording}
                    disabled={sending || uploading}
                    title={recording ? 'Detener grabación' : 'Grabar audio'}
                >
                    <Mic className="size-4" />
                </button>
                <div className="relative">
                    <button
                        type="button"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        title="Emojis"
                    >
                        <Smile className="size-4" />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-1 z-50">
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowEmojiPicker(false)}
                            />
                            <div className="relative z-50">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    skinTonesDisabled
                                    searchDisabled={false}
                                    width={300}
                                    height={350}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {selectedConv && (
                    <button
                        type="button"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                        onClick={onAiReply}
                        disabled={aiGenerating || sending || uploading || recording}
                        title="Responder con IA"
                    >
                        {aiGenerating ? (
                            <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        ) : (
                            <Sparkles className="size-4" />
                        )}
                    </button>
                )}
                <div className="flex-1" />
                <button
                    type="button"
                    className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                    onClick={onSendText}
                    disabled={!input.trim() || sending || uploading || recording}
                    title="Enviar"
                >
                    <Send className="size-3.5" />
                    Enviar
                </button>
            </div>
        </div>
    );
}
