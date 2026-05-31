import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Globe, Mail, MessageSquare, Phone, Shield, Users, FileText, Edit, Clock, Smartphone } from 'lucide-react';
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
import { countryFlag } from '@/lib/utils';
import type { Contact } from '@/types';

type Detail = Contact & {
    groups?: Array<{ id: number; name: string }>;
    members?: Array<{ id: number; name: string; phone: string }>;
};

type Props = {
    contactId: number | null;
    onClose: () => void;
};

export function ContactDetailSheet({ contactId, onClose }: Props) {
    const [detail, setDetail] = useState<Detail | null>(null);
    const [loading, setLoading] = useState(false);

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

    return (
        <Sheet open={contactId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
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
                                {detail.whatsapp_id && (
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs text-muted-foreground">WhatsApp ID</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                                            <p className="text-sm font-medium truncate font-mono text-xs">{detail.whatsapp_id}</p>
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
                                            <Link
                                                key={m.id}
                                                href={`/admin/contacts/${m.id}/edit`}
                                                className="block rounded-lg bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
                                            >
                                                {m.name ?? m.phone}
                                            </Link>
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

                            <div className="border-t pt-4">
                                <Link href={`/admin/contacts/${detail.id}/edit`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="size-3.5 mr-1" /> Edit Contact
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
