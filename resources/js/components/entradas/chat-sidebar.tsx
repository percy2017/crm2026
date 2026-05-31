import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    FileText,
    Globe,
    Image,
    Mail,
    Music,
    Phone,
    Smartphone,
    User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { show as adminContactsShow } from '@/routes/admin/contacts';
import type { LocalMessage } from '@/types';

type ContactDetail = {
    id: number;
    name: string | null;
    phone: string | null;
    whatsapp_id: string | null;
    email: string | null;
    notes: string | null;
    profile_pic_url: string | null;
    is_business: boolean;
    wa_status: string | null;
    country: string | null;
    website: string[] | null;
    instance: string | null;
    type: string;
};

type Props = {
    channelId: string | null;
    contactId: number | null;
    messages: LocalMessage[];
    onClose: () => void;
};

function formatPhone(jid: string | null): string {
    if (!jid) return '';
    const num = jid.replace(/[^0-9]/g, '');
    if (num.length >= 8) {
        return `+${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    }
    return `+${num}`;
}

function getCountryFlag(country: string | null): string {
    if (!country) return '';
    const codePoints = country
        .toUpperCase()
        .split('')
        .map((ch) => 127397 + ch.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
}

function getFileIcon(mimeType: string | null): string {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('video/')) return '🎬';
    return '📄';
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatSidebar({ channelId, contactId, messages, onClose }: Props) {
    const [contact, setContact] = useState<ContactDetail | null>(null);
    const [loading, setLoading] = useState(false);

    const sharedMedia = messages.filter((m) => m.media_url);

    useEffect(() => {
        if (!contactId) {
            setContact(null);
            return;
        }

        setLoading(true);
        fetch(adminContactsShow({ contact: contactId }).url, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setContact(data))
            .catch(() => setContact(null))
            .finally(() => setLoading(false));
    }, [contactId]);

    const isOpen = channelId !== null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" className="flex w-full max-w-md flex-col p-0 sm:max-w-lg">
                {loading && (
                    <div className="flex h-full items-center justify-center">
                        <p className="animate-pulse text-sm text-muted-foreground">
                            Cargando...
                        </p>
                    </div>
                )}

                {!loading && contact && (
                    <>
                        <div className="sticky top-0 z-10 border-b bg-card">
                            <SheetHeader className="px-6 py-4 text-left">
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-14 shrink-0">
                                        <AvatarImage src={contact.profile_pic_url ?? undefined} />
                                        <AvatarFallback className="text-lg">
                                            {(contact.name ?? '?').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <SheetTitle className="truncate text-lg">
                                            {contact.name || 'Sin nombre'}
                                        </SheetTitle>
                                        <SheetDescription className="flex items-center gap-2">
                                            <Phone className="size-3 shrink-0" />
                                            <span className="truncate">
                                                {formatPhone(contact.phone ?? contact.whatsapp_id)}
                                            </span>
                                        </SheetDescription>
                                        {contact.is_business && (
                                            <Badge variant="secondary" className="mt-1 text-[10px]">
                                                Business
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="size-3.5" />
                                        Email
                                    </div>
                                    <p className="truncate text-sm font-medium">
                                        {contact.email || '—'}
                                    </p>
                                </div>
                                <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Globe className="size-3.5" />
                                        País
                                    </div>
                                    <p className="truncate text-sm font-medium">
                                        {contact.country
                                            ? `${getCountryFlag(contact.country)} ${contact.country}`
                                            : '—'}
                                    </p>
                                </div>
                                <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Smartphone className="size-3.5" />
                                        Instancia
                                    </div>
                                    <p className="truncate text-sm font-medium">
                                        {contact.instance || '—'}
                                    </p>
                                </div>
                                <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <User className="size-3.5" />
                                        WhatsApp ID
                                    </div>
                                    <p className="truncate text-sm font-medium">
                                        {contact.whatsapp_id || '—'}
                                    </p>
                                </div>
                            </div>

                            {sharedMedia.length > 0 && (
                                <div className="border-t pt-4">
                                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Image className="size-3.5" />
                                        Archivos compartidos
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sharedMedia.map((msg) => (
                                            <a
                                                key={msg.id}
                                                href={msg.media_url!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-square overflow-hidden rounded-lg bg-muted/50"
                                            >
                                                {msg.message_type === 'imageMessage' ? (
                                                    <img
                                                        src={msg.media_url!}
                                                        alt=""
                                                        className="size-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center">
                                                        <span className="text-2xl">
                                                            {getFileIcon(msg.message_type)}
                                                        </span>
                                                        <span className="truncate text-[10px] text-muted-foreground">
                                                            {msg.text || 'Archivo'}
                                                        </span>
                                                    </div>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {contact.notes && (
                                <div className="border-t pt-4">
                                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <FileText className="size-3.5" />
                                        Notas
                                    </div>
                                    <div className="rounded-lg bg-muted/30 p-3 text-sm">
                                        {contact.notes}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 border-t bg-card p-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <a
                                    href={`/admin/contacts/${contact.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <User className="mr-2 size-4" />
                                    Ver contacto completo
                                </a>
                            </Button>
                        </div>
                    </>
                )}

                {!loading && !contact && isOpen && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            Contacto no encontrado
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
