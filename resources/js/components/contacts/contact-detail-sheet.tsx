import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { countryFlag } from '@/lib/utils';
import { index as adminContactsIndex } from '@/routes/admin/contacts';
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
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {loading ? 'Loading...' : detail?.name ?? 'Contact Details'}
                    </SheetTitle>
                </SheetHeader>

                {loading && (
                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                )}

                {!loading && detail && (
                    <div className="mt-6 space-y-6">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3">
                            {detail.profile_pic_url ? (
                                <img
                                    src={detail.profile_pic_url}
                                    alt={detail.name ?? 'Avatar'}
                                    referrerPolicy="no-referrer"
                                    className="size-14 rounded-full border object-cover"
                                />
                            ) : (
                                <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl text-muted-foreground">
                                    {(detail.name ?? '?')[0]}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold">{detail.name ?? '—'}</h3>
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    {detail.country && (
                                        <span>{countryFlag(detail.country)} {detail.country.toUpperCase()}</span>
                                    )}
                                    {detail.type === 'group' ? (
                                        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            Group{detail.participant_count != null && ` (${detail.participant_count})`}
                                        </span>
                                    ) : (
                                        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Individual
                                        </span>
                                    )}
                                    {detail.is_business && (
                                        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            Business
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {detail.phone && (
                                    <>
                                        <span className="text-muted-foreground">Phone</span>
                                        <span>{detail.phone}</span>
                                    </>
                                )}
                                {detail.email && (
                                    <>
                                        <span className="text-muted-foreground">Email</span>
                                        <span>{detail.email}</span>
                                    </>
                                )}
                                {detail.whatsapp_id && (
                                    <>
                                        <span className="text-muted-foreground">WhatsApp ID</span>
                                        <span className="font-mono text-xs break-all">{detail.whatsapp_id}</span>
                                    </>
                                )}
                                {detail.instance && (
                                    <>
                                        <span className="text-muted-foreground">Instance</span>
                                        <span>{detail.instance}</span>
                                    </>
                                )}
                                {detail.owner && (
                                    <>
                                        <span className="text-muted-foreground">Owner</span>
                                        <span>{detail.owner}</span>
                                    </>
                                )}
                                {detail.type === 'group' && detail.is_community && (
                                    <>
                                        <span className="text-muted-foreground">Community</span>
                                        <span>Yes</span>
                                    </>
                                )}
                                {detail.is_business && (
                                    <>
                                        <span className="text-muted-foreground">WhatsApp</span>
                                        <span><span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Business</span></span>
                                    </>
                                )}
                                {detail.wa_status && (
                                    <>
                                        <span className="text-muted-foreground">Status</span>
                                        <span>{detail.wa_status}</span>
                                    </>
                                )}
                                {detail.description && (
                                    <>
                                        <span className="text-muted-foreground">Description</span>
                                        <span className="whitespace-pre-wrap text-xs">{detail.description}</span>
                                    </>
                                )}
                                {detail.website && detail.website.length > 0 && (
                                    <>
                                        <span className="text-muted-foreground">Website</span>
                                        <span className="text-xs break-all">{detail.website.join(', ')}</span>
                                    </>
                                )}
                                {detail.last_synced_at && (
                                    <>
                                        <span className="text-muted-foreground">Last synced</span>
                                        <span>{new Date(detail.last_synced_at).toLocaleString()}</span>
                                    </>
                                )}
                                <>
                                    <span className="text-muted-foreground">Active</span>
                                    <span>{detail.is_active ? 'Yes' : 'No'}</span>
                                </>
                                <>
                                    <span className="text-muted-foreground">Created</span>
                                    <span>{new Date(detail.created_at).toLocaleString()}</span>
                                </>
                            </div>
                        </div>

                        {/* Groups (for individuals) */}
                        {detail.type === 'individual' && detail.groups && detail.groups.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Groups</h4>
                                <div className="space-y-1">
                                    {detail.groups.map((g) => (
                                        <Link
                                            key={g.id}
                                            href={`/admin/contacts/${g.id}/edit`}
                                            className="block rounded-md px-2 py-1 text-sm hover:bg-muted"
                                        >
                                            {g.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Members (for groups) */}
                        {detail.type === 'group' && detail.members && detail.members.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                    Members ({detail.members.length})
                                </h4>
                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                    {detail.members.map((m) => (
                                        <Link
                                            key={m.id}
                                            href={`/admin/contacts/${m.id}/edit`}
                                            className="block rounded-md px-2 py-1 text-sm hover:bg-muted"
                                        >
                                            {m.name ?? m.phone}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {detail.notes && (
                            <div>
                                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Notes</h4>
                                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                                    {detail.notes}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Link href={`/admin/contacts/${detail.id}/edit`}>
                                <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Link href={adminContactsIndex().url}>
                                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
