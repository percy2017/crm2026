import { Link, router } from '@inertiajs/react';
import { Globe, Mail, MessageSquare, Phone, Shield, Users, FileText, Edit, Clock, Smartphone, Trash2, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { countryFlag } from '@/lib/utils';
import type { Contact } from '@/types';

type Detail = Contact & {
    groups?: Array<{ id: number; name: string }>;
    members?: Array<{ id: number; name: string; phone: string; profile_pic_url: string | null }>;
    chats_count?: number;
    messages_count?: number;
    last_message_at?: string | null;
};

type Props = {
    contactId: number | null;
    onClose: () => void;
};

type InboxOption = {
    id: number;
    name: string;
    type: string;
};

export function ContactDetailSheet({ contactId, onClose }: Props) {
    const [detail, setDetail] = useState<Detail | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [tab, setTab] = useState<'detail' | 'send'>('detail');
    const [inboxes, setInboxes] = useState<InboxOption[]>([]);
    const [loadingInboxes, setLoadingInboxes] = useState(false);
    const [selectedInbox, setSelectedInbox] = useState('');
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!contactId) {
            setDetail(null);

            return;
        }

        setLoading(true);
        fetch(`/admin/contacts/${contactId}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => res.json() as Promise<Detail>)
            .then(setDetail)
            .finally(() => setLoading(false));
    }, [contactId]);

    useEffect(() => {
        if (tab === 'send' && detail) {
            setLoadingInboxes(true);
            setSelectedInbox('');
            setMessageText('');
            fetch('/admin/inboxes/list', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then((res) => {
                    if (!res.ok) {
return [];
}

                    return res.json() as Promise<InboxOption[]>;
                })
                .then((list) => {
                    setInboxes(list);

                    if (list.length === 1) {
                        setSelectedInbox(list[0].name);
                    }
                })
                .finally(() => setLoadingInboxes(false));
        }
    }, [tab, detail]);

    const handleSend = async () => {
        if (!selectedInbox || !messageText.trim() || !detail?.phone) {
return;
}

        setSending(true);

        try {
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

            const res = await fetch(`/admin/entradas/${selectedInbox}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    number: detail.phone,
                    text: messageText.trim(),
                }),
            });

            if (res.ok) {
                toast.success('Mensaje enviado correctamente');
                setMessageText('');
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error ?? 'Error al enviar mensaje');
            }
        } catch {
            toast.error('Error de conexión al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const goToChat = () => {
        if (!selectedInbox || !detail?.whatsapp_id && !detail?.phone) {
return;
}

        const channelId = detail.whatsapp_id ?? `${detail.phone}@s.whatsapp.net`;
        router.visit(`/admin/entradas/${selectedInbox}?channel_id=${encodeURIComponent(channelId)}`);
    };

    const handleClose = () => {
        setTab('detail');
        setDeleteOpen(false);
        onClose();
    };

    return (
        <Sheet open={contactId !== null} onOpenChange={(open) => {
 if (!open) {
handleClose();
} 
}}>
            <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto p-0">
                {loading && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-muted-foreground animate-pulse">Cargando contacto...</p>
                    </div>
                )}

                {!loading && detail && (
                    <>
                        <div className="sticky top-0 z-10 border-b bg-card px-6 py-4">
                            <SheetHeader className="text-left">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="size-12 shrink-0">
                                            {detail.profile_pic_url ? (
                                                <AvatarImage src={detail.profile_pic_url} alt={detail.name ?? 'Avatar'} />
                                            ) : null}
                                            <AvatarFallback className="text-base font-bold">
                                                {(detail.name ?? '?')[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <SheetTitle className="text-lg truncate">{detail.name ?? '—'}</SheetTitle>
                                            <SheetDescription>
                                                {detail.country && (
                                                    <span>{countryFlag(detail.country)} {detail.country.toUpperCase()}</span>
                                                )}
                                                {detail.phone && (!detail.country) && (
                                                    <span>{detail.phone}</span>
                                                )}
                                            </SheetDescription>
                                            {detail.whatsapp_id && (
                                                <p className="mt-0.5 truncate text-xs font-mono text-muted-foreground">
                                                    {detail.whatsapp_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-1">
                                        {detail.type === 'group' ? (
                                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                                                Group{detail.participant_count != null && ` (${detail.participant_count})`}
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                Individual
                                            </Badge>
                                        )}
                                        {detail.is_business && (
                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                                                Business
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex border-b">
                            <button
                                className={`flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                                    tab === 'detail'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setTab('detail')}
                            >
                                Detalle
                            </button>
                            <button
                                className={`flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                                    tab === 'send'
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setTab('send')}
                            >
                                Enviar Mensaje
                            </button>
                        </div>

                        {tab === 'detail' && (
                            <div className="px-6 py-4 space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {detail.phone && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Phone</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Phone className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm font-medium truncate">{detail.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {detail.email && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Mail className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm font-medium truncate">{detail.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {detail.instance && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Instance</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Smartphone className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm font-medium truncate">{detail.instance}</p>
                                            </div>
                                        </div>
                                    )}
                                    {detail.is_business && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">WhatsApp</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] px-1.5 py-0">
                                                    Business
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    {detail.wa_status && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">WA Status</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Shield className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm font-medium capitalize truncate">{detail.wa_status}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">Active</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Shield className="size-3.5 text-muted-foreground shrink-0" />
                                            <p className={`text-sm font-medium ${detail.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {detail.is_active ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    </div>
                                    {detail.owner && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Owner</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Users className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm font-medium truncate">{detail.owner}</p>
                                            </div>
                                        </div>
                                    )}
                                    {detail.type === 'group' && detail.is_community && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Community</p>
                                            <p className="text-sm font-medium text-green-600">Yes</p>
                                        </div>
                                    )}
                                    {detail.description && (
                                        <div className="rounded-lg bg-muted/50 p-3 col-span-2">
                                            <p className="text-xs text-muted-foreground">Description</p>
                                            <p className="text-sm whitespace-pre-wrap mt-0.5">{detail.description}</p>
                                        </div>
                                    )}
                                    {detail.website && detail.website.length > 0 && (
                                        <div className="rounded-lg bg-muted/50 p-3 col-span-2">
                                            <p className="text-xs text-muted-foreground">Website</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Globe className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm break-all">{detail.website.join(', ')}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">Created</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Clock className="size-3.5 text-muted-foreground shrink-0" />
                                            <p className="text-sm font-medium">{new Date(detail.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {detail.last_synced_at && (
                                        <div className="rounded-lg bg-muted/50 p-3">
                                            <p className="text-xs text-muted-foreground">Last synced</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                                                <p className="text-sm font-medium">{new Date(detail.last_synced_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(detail.chats_count !== undefined && detail.chats_count > 0) && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MessageSquare className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chat Stats</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-lg font-bold">{detail.chats_count}</p>
                                                <p className="text-[10px] text-muted-foreground">Conversations</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-lg font-bold">{detail.messages_count}</p>
                                                <p className="text-[10px] text-muted-foreground">Messages</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                                                <p className="text-lg font-bold">{detail.last_message_at ? new Date(detail.last_message_at).toLocaleDateString() : '—'}</p>
                                                <p className="text-[10px] text-muted-foreground">Last Activity</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detail.type === 'individual' && detail.groups && detail.groups.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Groups ({detail.groups.length})
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            {detail.groups.map((g) => (
                                                <Link
                                                    key={g.id}
                                                    href={`/admin/contacts/${g.id}/edit`}
                                                    className="block rounded-lg bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
                                                >
                                                    {g.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detail.type === 'group' && detail.members && detail.members.length > 0 && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Members ({detail.members.length})
                                            </p>
                                        </div>
                                        <div className="max-h-48 space-y-1 overflow-y-auto">
                                            {detail.members.map((m) => (
                                                <div key={m.id} className="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2 hover:bg-muted/40">
                                                    <Avatar className="size-7 shrink-0">
                                                        <AvatarImage src={m.profile_pic_url ?? undefined} />
                                                        <AvatarFallback className="text-[10px]">
                                                            {(m.name ?? '?')[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1 text-sm">
                                                        <p className="truncate font-medium">{m.name ?? '—'}</p>
                                                        <p className="truncate text-xs text-muted-foreground">{m.phone}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detail.notes && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="size-4 text-muted-foreground" />
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                            {detail.notes}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <Link href={`/admin/contacts/${detail.id}/edit`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Edit className="size-3.5 mr-1" /> Edit Contact
                                            </Button>
                                        </Link>
                                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeleteOpen(true)}>
                                            <Trash2 className="size-3.5 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'send' && (
                            <div className="px-6 py-4 space-y-4">
                                {loadingInboxes ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : !detail.phone && !detail.whatsapp_id ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Este contacto no tiene número de teléfono.
                                    </p>
                                ) : (
                                    <>
                                        <div className="rounded-lg bg-muted/30 p-3">
                                            <p className="text-xs text-muted-foreground">Contacto</p>
                                            <p className="text-sm font-medium mt-0.5">{detail.name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{detail.phone ?? detail.whatsapp_id}</p>
                                        </div>

                                        {inboxes.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-8">
                                                No hay inboxes activos disponibles.
                                            </p>
                                        ) : (
                                            <>
                                                <div>
                                                    <Label className="text-xs font-semibold text-muted-foreground">Inbox</Label>
                                                    <select
                                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={selectedInbox}
                                                        onChange={(e) => setSelectedInbox(e.target.value)}
                                                    >
                                                        <option value="">Seleccionar inbox...</option>
                                                        {inboxes.map((inb) => (
                                                            <option key={inb.id} value={inb.name}>
                                                                {inb.type === 'evolution' ? '📱 WhatsApp - ' : '🌐 Web - '}{inb.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label className="text-xs font-semibold text-muted-foreground">Mensaje</Label>
                                                    <Textarea
                                                        className="mt-1 min-h-[120px] resize-none"
                                                        placeholder="Escribe tu mensaje aquí..."
                                                        value={messageText}
                                                        onChange={(e) => setMessageText(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        className="flex-1"
                                                        disabled={!selectedInbox || !messageText.trim() || sending}
                                                        onClick={handleSend}
                                                    >
                                                        {sending ? (
                                                            <Loader2 className="size-4 mr-1.5 animate-spin" />
                                                        ) : (
                                                            <Send className="size-4 mr-1.5" />
                                                        )}
                                                        Enviar Mensaje
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        disabled={!selectedInbox}
                                                        onClick={goToChat}
                                                    >
                                                        <MessageSquare className="size-4 mr-1.5" />
                                                        Ir al Chat
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}

                {deleteOpen && detail && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="rounded-xl border bg-card p-6 shadow-lg mx-4 w-full max-w-sm">
                            <h3 className="text-lg font-semibold">Delete Contact</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Are you sure you want to delete &ldquo;{detail.name ?? detail.phone ?? 'this contact'}&rdquo;?
                            </p>
                            <div className="mt-4 flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                                <Button variant="destructive" size="sm" onClick={() => {
                                    router.delete(`/admin/contacts/${detail.id}`, {
                                        preserveScroll: true,
                                        onSuccess: () => {
 setDeleteOpen(false); handleClose(); 
},
                                    });
                                }}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
