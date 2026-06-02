import {
    Copy,
    FileText,
    Globe,
    Image,
    Mail,
    Pencil,
    Phone,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
    contactPhone?: string | null;
    contactName?: string | null;
    contactAvatar?: string | null;
    messages: LocalMessage[];
    onClose: () => void;
    onDelete?: () => void;
};

function getCountryFlag(country: string | null): string {
    if (!country) {
return '';
}

    const codePoints = country
        .toUpperCase()
        .split('')
        .map((ch) => 127397 + ch.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
}

function getFileIcon(mimeType: string | null): string {
    if (!mimeType) {
return '📄';
}

    if (mimeType.startsWith('image/')) {
return '🖼';
}

    if (mimeType.startsWith('audio/')) {
return '🎵';
}

    if (mimeType.startsWith('video/')) {
return '🎬';
}

    return '📄';
}

export default function ChatSidebar({ channelId, contactId, contactPhone, contactName, contactAvatar, messages, onClose, onDelete }: Props) {
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

    const displayName = contact?.name ?? contactName ?? channelId ?? '—';
    const displayPhone = contact?.phone ?? contact?.whatsapp_id ?? contactPhone ?? '—';
    const displayAvatar = contact?.profile_pic_url ?? contactAvatar;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => {
 if (!open) {
onClose();
} 
}}>
            <SheetContent side="right" className="flex w-full max-w-md flex-col p-0 sm:max-w-lg">
                <div className="sticky top-0 z-10 border-b bg-card">
                    <SheetHeader className="px-6 py-4 text-left">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-14 shrink-0">
                                <AvatarImage src={displayAvatar ?? undefined} />
                                <AvatarFallback className="text-lg">
                                    {(displayName ?? '?').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <SheetTitle className="truncate text-lg">
                                    {displayName}
                                </SheetTitle>
                                <SheetDescription className="flex items-center gap-2">
                                    <Phone className="size-3 shrink-0" />
                                    <span className="truncate text-xs">{displayPhone}</span>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(displayPhone);
                                            toast.success('Teléfono copiado');
                                        }}
                                        className="shrink-0 text-muted-foreground hover:text-foreground"
                                        title="Copiar"
                                    >
                                        <Copy className="size-3" />
                                    </button>
                                </SheetDescription>
                                {contact?.is_business && (
                                    <Badge variant="secondary" className="mt-1 text-[10px]">
                                        Business
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                {loading && (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="animate-pulse text-sm text-muted-foreground">Cargando...</p>
                    </div>
                )}

                {!loading && contact && (
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
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {sharedMedia.map((msg) => (
                                        <a
                                            key={msg.id}
                                            href={msg.media_url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group size-16 shrink-0 overflow-hidden rounded-lg bg-muted/50"
                                        >
                                            {msg.message_type === 'imageMessage' || msg.message_type === 'stickerMessage' ? (
                                                <img
                                                    src={msg.media_url!}
                                                    alt=""
                                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center gap-0.5 p-1 text-center">
                                                    <span className="text-lg">
                                                        {getFileIcon(msg.message_type)}
                                                    </span>
                                                    <span className="truncate text-[9px] text-muted-foreground">
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
                )}

                {!loading && !contact && contactName && (
                    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Phone className="size-3.5" />
                                    Teléfono
                                </div>
                                <p className="truncate text-sm font-medium">
                                    {displayPhone}
                                </p>
                            </div>
                        </div>

                        {sharedMedia.length > 0 && (
                            <div className="border-t pt-4">
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <Image className="size-3.5" />
                                    Archivos compartidos
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {sharedMedia.map((msg) => (
                                        <a
                                            key={msg.id}
                                            href={msg.media_url!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group size-16 shrink-0 overflow-hidden rounded-lg bg-muted/50"
                                        >
                                            {msg.message_type === 'imageMessage' || msg.message_type === 'stickerMessage' ? (
                                                <img
                                                    src={msg.media_url!}
                                                    alt=""
                                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center gap-0.5 p-1 text-center">
                                                    <span className="text-lg">
                                                        {getFileIcon(msg.message_type)}
                                                    </span>
                                                    <span className="truncate text-[9px] text-muted-foreground">
                                                        {msg.text || 'Archivo'}
                                                    </span>
                                                </div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="sticky bottom-0 border-t bg-card p-4">
                    {contact && (
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" asChild>
                                <a href={`/admin/contacts/${contact.id}`} target="_blank" rel="noopener noreferrer">
                                    <User className="mr-2 size-4" />
                                    Ver contacto
                                </a>
                            </Button>
                            <Button variant="outline" className="flex-1" asChild>
                                <a href={`/admin/contacts/${contact.id}/edit`} target="_blank" rel="noopener noreferrer">
                                    <Pencil className="mr-2 size-4" />
                                    Editar
                                </a>
                            </Button>
                        </div>
                    )}
                    <div className="mt-2 flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={async () => {
                                await navigator.clipboard.writeText(displayPhone);
                                toast.success('Teléfono copiado');
                            }}>
                            <Copy className="mr-2 size-4" />
                            Copiar teléfono
                        </Button>
                        {onDelete && (
                            <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={onDelete}>
                                <Trash2 className="mr-2 size-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
