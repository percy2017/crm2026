import { Head, Link, router } from '@inertiajs/react';
import { RefreshCw, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, countryFlag } from '@/lib/utils';
import { index as adminContactsIndex } from '@/routes/admin/contacts';
import { update as adminContactsUpdate } from '@/routes/admin/contacts';
import type { Contact } from '@/types';

export default function ContactsEdit({ contact, instances, countries, inboxes, members }: { contact: Contact; instances: string[]; countries: string[]; inboxes: { id: number; name: string }[]; members: { id: number; name: string | null; phone: string | null; profile_pic_url: string | null }[] }) {
    const [mode, setMode] = useState<'manual' | 'evolution'>('manual');
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncInbox, setSyncInbox] = useState(contact.instance ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [values, setValues] = useState({
        name: contact.name ?? '',
        phone: contact.phone ?? '',
        whatsapp_id: contact.whatsapp_id ?? '',
        email: contact.email ?? '',
        notes: contact.notes ?? '',
        profile_pic_url: contact.profile_pic_url ?? '',
        country: contact.country ?? '',
        is_active: contact.is_active,
        is_business: contact.is_business,
        wa_status: contact.wa_status ?? '',
        description: contact.description ?? '',
        website: contact.website ? JSON.stringify(contact.website) : '',
    });

    const [evoNumber, setEvoNumber] = useState('');
    const [fetching, setFetching] = useState(false);

    const handleChange = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleFetchFromEvolution = async () => {
        if (!evoNumber) {
            return;
        }

        setFetching(true);
        setErrors({});

        try {
            const res = await fetch('/admin/contacts/fetch-from-evolution', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ number: evoNumber }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors({ fetch: data.error ?? 'Failed to fetch contact' });

                return;
            }

            const data = await res.json();

            if (!data.numberExists) {
                setErrors({ fetch: 'Number not found on WhatsApp' });

                return;
            }

            setValues((prev) => ({
                ...prev,
                name: data.name ?? prev.name,
                phone: data.phone ?? prev.phone,
                whatsapp_id: data.whatsapp_id ?? prev.whatsapp_id,
                country: data.country ?? prev.country,
                is_business: data.is_business ?? prev.is_business,
                wa_status: data.wa_status ?? prev.wa_status,
                description: data.description ?? prev.description,
                website: data.website ? JSON.stringify(data.website) : prev.website,
                profile_pic_url: data.profile_pic_url ?? prev.profile_pic_url,
            }));

            if (data.already_exists && data.existing_contact?.id !== contact.id) {
                setErrors({
                    fetch: `⚠️ This number already exists as "${data.existing_contact.name}" (ID: ${data.existing_contact.id})`,
                });

                return;
            }
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        router.put(adminContactsUpdate(contact.id).url, values, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setSaving(false),
        });
    };

    const picPreview = values.profile_pic_url && !values.profile_pic_url.startsWith('http')
        ? `/storage/${values.profile_pic_url}`
        : values.profile_pic_url;

    const isGroup = contact.type === 'group';

    return (
        <>
            <Head title={`Edit ${contact.name ?? 'Contact'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title={`Edit: ${contact.name ?? 'Contact'}`}
                    description={
                        isGroup
                            ? `Group • ${contact.participant_count ?? '?'} members`
                            : 'Update contact information'
                    }
                />

{isGroup ? (
                    <>
                        <div className="flex gap-1 self-start rounded-lg border bg-muted p-1">
                            <button
                                type="button"
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    mode === 'manual' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                                )}
                                onClick={() => setMode('manual')}
                            >
                                Manual
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    mode === 'evolution' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                                )}
                                onClick={() => setMode('evolution')}
                            >
                                Via Evolution
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
                            {mode === 'evolution' && (
                                <div className="rounded-lg border p-4 space-y-3">
                                    <h3 className="text-sm font-medium">Sync via Evolution API</h3>
                                    <div className="flex items-center gap-3">
                                        {picPreview ? (
                                            <img src={picPreview} alt={contact.name ?? 'Group'} className="size-12 rounded-full border object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg text-muted-foreground">
                                                {(contact.name ?? 'G')[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold">{contact.name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">{contact.instance ?? '—'} • {contact.participant_count ?? 0} members</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instancia</label>
                                        <select
                                            value={syncInbox}
                                            onChange={(e) => setSyncInbox(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {inboxes.map((inb) => (
                                                <option key={inb.id} value={inb.name}>{inb.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                    <Button
                                        type="button"
                                        variant="default"
                                        disabled={!syncInbox || syncing}
                                        onClick={async () => {
                                            setSyncing(true);

                                            try {
                                                const res = await fetch(`/admin/contacts/${contact.id}/sync-group`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Accept: 'application/json',
                                                        'X-Requested-With': 'XMLHttpRequest',
                                                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                                                    },
                                                    body: JSON.stringify({ instance: syncInbox }),
                                                });
                                                const data = await res.json();

                                                if (data.error) {
 toast.error(data.error);

 return; 
}

                                                toast.success(`Sincronizado: ${data.synced_members} miembros, ${data.enriched ?? 0} enriquecidos, ${data.skipped} omitidos`);
                                                router.reload();
                                            } catch {
                                                toast.error('Error al sincronizar grupo');
                                            } finally {
                                                setSyncing(false);
                                            }
                                        }}
                                    >
                                        <RefreshCw className={`size-3.5 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                                        {syncing ? 'Sincronizando...' : 'Sync Group'}
                                    </Button>
                                    </div>
                                </div>
                            )}

                            {mode === 'manual' && (
                                <div className="rounded-lg border p-4 space-y-4">
                                    <h3 className="text-sm font-medium">Group Info</h3>
                                    <div className="flex items-center gap-3">
                                        {picPreview ? (
                                            <img src={picPreview} alt={contact.name ?? 'Group'} className="size-12 rounded-full border object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg text-muted-foreground">
                                                {(contact.name ?? 'G')[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold">{contact.name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">{contact.instance ?? '—'} • {contact.participant_count ?? 0} members</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={values.name}
                                            onChange={handleChange('name')}
                                            placeholder="Group name"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Description</Label>
                                        <textarea
                                            id="notes"
                                            value={values.notes}
                                            onChange={handleChange('notes')}
                                            placeholder="Group description..."
                                            rows={3}
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {mode === 'manual' && (
                                    <Button type="submit" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                )}
                                <Link href={adminContactsIndex().url}>
                                    <Button type="button" variant="outline">Back to Contacts</Button>
                                </Link>
                            </div>
                        </form>

                        {members.length > 0 && (
                        <div className="max-w-lg space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="size-4 text-muted-foreground" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Members ({members.length})
                                </p>
                            </div>
                            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border">
                                {members.map((m) => (
                                    <div key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50">
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
                    </>
                ) : (
                    <> <div className="flex gap-1 self-start rounded-lg border bg-muted p-1">
                        <button
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                mode === 'manual' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setMode('manual')}
                        >
                            Manual
                        </button>
                        <button
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                mode === 'evolution' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setMode('evolution')}
                        >
                            From Evolution
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
                        {mode === 'evolution' && (
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">Fetch from Evolution API</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="number">Phone Number</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="number"
                                            value={evoNumber}
                                            onChange={(e) => setEvoNumber(e.target.value)}
                                            placeholder="59169375664"
                                            className="flex-1"
                                        />
                                        <Button type="button" onClick={handleFetchFromEvolution} disabled={fetching}>
                                            {fetching ? 'Fetching...' : 'Get'}
                                        </Button>
                                    </div>
                                </div>
                                {values.is_business && (
                                    <div className="text-sm">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            Business Account
                                        </span>
                                    </div>
                                )}
                                {values.country && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Country: </span>
                                        <span className="font-medium">{countryFlag(values.country)} {values.country.toUpperCase()}</span>
                                    </div>
                                )}
                                {values.wa_status && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Status: </span>
                                        <span className="font-medium">{values.wa_status}</span>
                                    </div>
                                )}
                                {values.description && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Description: </span>
                                        <span className="whitespace-pre-wrap">{values.description}</span>
                                    </div>
                                )}
                                {values.website && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Website: </span>
                                        <span className="font-medium">{values.website}</span>
                                    </div>
                                )}
                                {errors.fetch && (
                                    <p className="text-sm text-red-500">{errors.fetch}</p>
                                )}
                                {picPreview && (
                                    <div>
                                        <Label>Photo Preview</Label>
                                        <img src={picPreview} alt="Preview" className="mt-1 size-16 rounded-full border object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="text-sm font-medium">Contact Info</h3>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={values.name}
                                    onChange={handleChange('name')}
                                    placeholder="Full name"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={values.phone}
                                    onChange={handleChange('phone')}
                                    placeholder="59169375664"
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>
                            {values.whatsapp_id && (
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp_id">WhatsApp ID</Label>
                                    <Input
                                        id="whatsapp_id"
                                        value={values.whatsapp_id}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={values.email}
                                    onChange={handleChange('email')}
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    value={values.notes}
                                    onChange={handleChange('notes')}
                                    placeholder="Additional notes..."
                                    rows={3}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="country"
                                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                        value={values.country}
                                        onChange={(e) => setValues((prev) => ({ ...prev, country: e.target.value }))}
                                    >
                                        <option value="">Auto-detect</option>
                                        {countries.map((c) => (
                                            <option key={c} value={c}>
                                                {countryFlag(c)} {c.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                    {values.country && (
                                        <span className="text-lg">{countryFlag(values.country)}</span>
                                    )}
                                </div>
                            </div>
                            {picPreview && (
                                <div>
                                    <Label>Photo preview</Label>
                                    <img src={picPreview} alt="Preview" className="mt-1 size-16 rounded-full border object-cover" referrerPolicy="no-referrer" />
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    checked={values.is_active}
                                    onCheckedChange={(checked) => setValues((prev) => ({ ...prev, is_active: checked === true }))}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_business"
                                    checked={values.is_business}
                                    onCheckedChange={(checked) => setValues((prev) => ({ ...prev, is_business: checked === true }))}
                                />
                                <Label htmlFor="is_business" className="cursor-pointer">Business Account</Label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Link href={adminContactsIndex().url}>
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                    </>
                )}
            </div>
        </>
    );
}
