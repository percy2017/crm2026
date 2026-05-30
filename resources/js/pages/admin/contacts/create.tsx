import { Head, Link, router } from '@inertiajs/react';
import { flushSync } from 'react-dom';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { index as adminContactsIndex } from '@/routes/admin/contacts';
import { cn, countryFlag } from '@/lib/utils';

type FormValues = {
    name: string;
    phone: string;
    whatsapp_id: string;
    email: string;
    notes: string;
    profile_pic_url: string;
    is_active: boolean;
    is_business: boolean;
    wa_status: string;
    description: string;
    website: string;
    country: string;
};

type ScannedGroup = {
    instance: string;
    group_jid: string;
    subject: string;
    size: number;
    picture_url: string | null;
    description: string | null;
    owner: string | null;
    is_community: boolean;
    already_imported: boolean;
    existing_group_id: number | null;
    participants: Array<{
        phone: string;
        name: string | null;
        is_admin: boolean;
        imgUrl: string | null;
    }>;
};

export default function ContactsCreate({ instances, countries }: { instances: string[]; countries: string[] }) {
    const [mode, setMode] = useState<'manual' | 'evolution' | 'import' | 'groups'>('manual');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [values, setValues] = useState<FormValues>({
        name: '',
        phone: '',
        whatsapp_id: '',
        email: '',
        notes: '',
        profile_pic_url: '',
        is_active: true,
        is_business: false,
        wa_status: '',
        description: '',
        website: '',
        country: '',
    });

    const [evoNumber, setEvoNumber] = useState('');
    const [evoStep, setEvoStep] = useState<'idle' | 'verifying' | 'fetching' | 'downloading' | 'done' | 'error'>('idle');

    const [selectedInstances, setSelectedInstances] = useState<Record<string, boolean>>(
        Object.fromEntries(instances.map((i) => [i, true])),
    );
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState<{
        contacts: Array<{ name: string | null; phone: string; whatsapp_id: string | null; profile_pic_url: string | null }>;
        total: number;
        errors: string[];
    } | null>(null);

    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
    const [importDone, setImportDone] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);

    // Groups tab state
    const [groupsScanning, setGroupsScanning] = useState(false);
    const [scannedGroups, setScannedGroups] = useState<ScannedGroup[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<Record<string, boolean>>({});
    const [groupsScanDone, setGroupsScanDone] = useState(false);
    const [groupsStats, setGroupsStats] = useState<{ total_groups: number; total_members: number; new_contacts: number } | null>(null);
    const [groupsImporting, setGroupsImporting] = useState(false);
    const [groupsProgress, setGroupsProgress] = useState({ done: 0, total: 0 });
    const [groupsImportDone, setGroupsImportDone] = useState(false);

    const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleFetchFromEvolution = async () => {
        if (!evoNumber) {
            return;
        }

        flushSync(() => {
            setEvoStep('verifying');
            setErrors({});
        });

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

            flushSync(() => {
                setEvoStep('fetching');
            });

            if (!res.ok) {
                const data = await res.json();
                flushSync(() => {
                    setErrors({ fetch: data.error ?? 'Failed to fetch contact' });
                    setEvoStep('error');
                });

                return;
            }

            const data = await res.json();

            if (!data.numberExists || !data.verified) {
                flushSync(() => {
                    setErrors({ fetch: 'Number not found on WhatsApp' });
                    setEvoStep('error');
                });

                return;
            }

            flushSync(() => {
                setEvoStep('downloading');
            });

            await new Promise((r) => setTimeout(r, 300));

            flushSync(() => {
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
                setEvoStep('done');
            });

            if (data.already_exists) {
                flushSync(() => {
                    setErrors({
                        fetch: `⚠️ This number already exists as "${data.existing_contact.name}" (ID: ${data.existing_contact.id})`,
                    });
                });
            }
        } catch (e) {
            flushSync(() => {
                setErrors({ fetch: 'Network error' });
                setEvoStep('error');
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setErrors({});

        router.post('/admin/contacts', values, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setLoading(false),
        });
    };

    const handleScan = async () => {
        const instancesToScan = instances.filter((i) => selectedInstances[i]);

        if (instancesToScan.length === 0) {
            return;
        }

        setScanning(true);
        setScanned(null);
        setImportDone(false);
        setErrors({});

        try {
            const res = await fetch('/admin/contacts/scan-instances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ instances: instancesToScan }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors({ import: data.error ?? 'Scan failed' });

                return;
            }

            const data = await res.json();
            setScanned(data);
        } catch (e) {
            setErrors({ import: 'Network error during scan' });
        } finally {
            setScanning(false);
        }
    };

    const handleImport = async () => {
        if (!scanned || scanned.contacts.length === 0) {
            return;
        }

        const instancesToImport = instances.filter((i) => selectedInstances[i]);

        if (instancesToImport.length === 0) {
            return;
        }

        setImporting(true);
        setImportProgress({ done: 0, total: scanned.total });
        setImportDone(false);
        setImportErrors([]);
        setErrors({});

        const BATCH_SIZE = 5;
        const all = scanned.contacts;

        for (let i = 0; i < all.length; i += BATCH_SIZE) {
            const batch = all.slice(i, i + BATCH_SIZE);

            try {
                const res = await fetch('/admin/contacts/import-batch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ contacts: batch, instances: instancesToImport }),
                });

                if (res.ok) {
                    const data = await res.json();
                    setImportProgress({ done: Math.min(i + BATCH_SIZE, all.length), total: all.length });

                    if (data.errors?.length > 0) {
                        setImportErrors((prev) => [...prev, ...data.errors]);
                    }
                } else {
                    const data = await res.json();
                    setImportErrors((prev) => [...prev, `Batch ${i / BATCH_SIZE + 1}: ${data.error ?? 'Import failed'}`]);
                }
            } catch (e) {
                setImportErrors((prev) => [...prev, `Batch ${i / BATCH_SIZE + 1}: network error`]);
            }
        }

        setImportDone(true);
        setImporting(false);
    };

    const handleScanGroups = async () => {
        const instancesToScan = instances.filter((i) => selectedInstances[i]);

        if (instancesToScan.length === 0) {
            return;
        }

        setGroupsScanning(true);
        setScannedGroups([]);
        setSelectedGroups({});
        setGroupsScanDone(false);
        setGroupsStats(null);
        setErrors({});

        try {
            const res = await fetch('/admin/contacts/scan-groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ instances: instancesToScan }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors({ groups: data.error ?? 'Scan failed' });

                return;
            }

            const data = await res.json();
            setScannedGroups(data.groups);
            setGroupsStats({
                total_groups: data.total_groups,
                total_members: data.total_members,
                new_contacts: data.new_contacts,
            });
            setGroupsScanDone(true);

            const initial: Record<string, boolean> = {};
            data.groups.forEach((g: ScannedGroup) => {
                initial[g.group_jid] = !g.already_imported;
            });
            setSelectedGroups(initial);
        } catch (e) {
            setErrors({ groups: 'Network error during scan' });
        } finally {
            setGroupsScanning(false);
        }
    };

    const handleImportGroups = async () => {
        const selected = scannedGroups.filter((g) => selectedGroups[g.group_jid]);

        if (selected.length === 0) {
            return;
        }

        setGroupsImporting(true);
        setGroupsImportDone(false);
        setImportErrors([]);
        setErrors({});

        const totalMembers = selected.reduce((sum, g) => sum + g.participants.length, 0);
        setGroupsProgress({ done: 0, total: totalMembers });

        let doneSoFar = 0;

        for (const group of selected) {
            try {
                const res = await fetch('/admin/contacts/import-group-members', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ group }),
                });

                if (res.ok) {
                    const data = await res.json();
                    doneSoFar += group.participants.length;
                    setGroupsProgress({ done: doneSoFar, total: totalMembers });

                    if (data.errors?.length > 0) {
                        setImportErrors((prev) => [...prev, ...data.errors]);
                    }
                } else {
                    const data = await res.json();
                    setImportErrors((prev) => [...prev, `Group "${group.subject}": ${data.error ?? 'Import failed'}`]);
                }
            } catch (e) {
                setImportErrors((prev) => [...prev, `Group "${group.subject}": network error`]);
            }
        }

        setGroupsImportDone(true);
        setGroupsImporting(false);
    };

    const toggleGroup = (jid: string) => {
        setSelectedGroups((prev) => ({ ...prev, [jid]: !prev[jid] }));
    };

    const picPreview = values.profile_pic_url && !values.profile_pic_url.startsWith('http')
        ? `/storage/${values.profile_pic_url}`
        : values.profile_pic_url;

    const anySelected = Object.values(selectedGroups).some(Boolean);

    return (
        <>
            <Head title="Create Contact" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Create Contact"
                    description="Add a new contact manually, fetch from Evolution API, or import from groups"
                />

                <div className="flex flex-wrap gap-1 self-start rounded-lg border bg-muted p-1">
                    {(['manual', 'evolution', 'import', 'groups'] as const).map((m) => (
                        <button
                            key={m}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                mode === m ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setMode(m)}
                        >
                            {m === 'groups' ? 'From Groups' : m === 'manual' ? 'Manual' : m === 'evolution' ? 'From Evolution' : 'Import'}
                        </button>
                    ))}
                </div>

                {mode === 'groups' ? (
                    <div className="max-w-2xl space-y-6">
                        {!groupsScanDone ? (
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">Import Groups & Members</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select instances to scan for WhatsApp groups and their members.
                                </p>

                                <div className="space-y-2">
                                    {instances.map((inst) => (
                                        <label key={inst} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={selectedInstances[inst] ?? true}
                                                onCheckedChange={(checked) =>
                                                    setSelectedInstances((prev) => ({ ...prev, [inst]: checked === true }))
                                                }
                                            />
                                            {inst}
                                        </label>
                                    ))}
                                </div>

                                <Button onClick={handleScanGroups} disabled={groupsScanning}>
                                    {groupsScanning ? 'Scanning...' : 'Scan Groups'}
                                </Button>

                                {errors.groups && (
                                    <p className="text-sm text-red-500">{errors.groups}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-medium">Groups found</h3>
                                        {groupsStats && (
                                            <span className="text-sm text-muted-foreground">
                                                {groupsStats.total_groups} groups • {groupsStats.total_members} members • <span className="text-green-600">{groupsStats.new_contacts} new contacts</span>
                                            </span>
                                        )}
                                    </div>

                                    {errors.groups && (
                                        <p className="mb-3 text-sm text-red-500">{errors.groups}</p>
                                    )}

                                    <div className="space-y-2">
                                        {scannedGroups.map((g) => (
                                            <label
                                                key={g.group_jid}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50',
                                                    g.already_imported && 'opacity-50',
                                                )}
                                            >
                                                <Checkbox
                                                    checked={selectedGroups[g.group_jid] ?? false}
                                                    disabled={g.already_imported}
                                                    onCheckedChange={() => toggleGroup(g.group_jid)}
                                                />
                                                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                                                    {g.picture_url ? (
                                                        <img src={g.picture_url} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">{(g.subject ?? '?')[0]}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">{g.subject}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {g.instance} • {g.participants.length} members
                                                        {g.already_imported && ' (already imported)'}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {groupsImporting && (
                                    <div className="space-y-2 rounded-lg border p-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Importing groups & members...</span>
                                            <span>{groupsProgress.done} / {groupsProgress.total}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-300"
                                                style={{
                                                    width: `${groupsProgress.total > 0 ? (groupsProgress.done / groupsProgress.total) * 100 : 0}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {groupsImportDone && (
                                    <div className="rounded-lg border border-green-200 p-3 text-sm text-green-600">
                                        <p className="font-medium">Import complete! {groupsProgress.done} members processed.</p>
                                    </div>
                                )}

                                {importErrors.length > 0 && (
                                    <div className="rounded-lg border border-red-200 p-3 text-sm text-red-600">
                                        <p className="mb-1 font-medium">Errors ({importErrors.length}):</p>
                                        <ul className="list-inside list-disc">
                                            {importErrors.slice(0, 5).map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                            {importErrors.length > 5 && (
                                                <li>...and {importErrors.length - 5} more</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {!groupsImporting && !groupsImportDone && anySelected && (
                                        <Button onClick={handleImportGroups}>
                                            Import Selected ({scannedGroups.filter((g) => selectedGroups[g.group_jid]).reduce((s, g) => s + g.participants.length, 0)} members)
                                        </Button>
                                    )}
                                    {groupsImportDone && (
                                        <Link href={adminContactsIndex().url}>
                                            <Button type="button" variant="outline">Back to Contacts</Button>
                                        </Link>
                                    )}
                                    <Button variant="outline" onClick={() => { setGroupsScanDone(false); setScannedGroups([]); }}>
                                        Back
                                    </Button>
                                    <Link href={adminContactsIndex().url}>
                                        <Button type="button" variant="outline">Back to Contacts</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                ) : mode === 'import' ? (
                    <div className="max-w-lg space-y-6">
                        {!scanned ? (
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">Import from Evolution</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select instances to scan for new contacts.
                                </p>

                                <div className="space-y-2">
                                    {instances.map((inst) => (
                                        <label key={inst} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={selectedInstances[inst] ?? true}
                                                onCheckedChange={(checked) =>
                                                    setSelectedInstances((prev) => ({ ...prev, [inst]: checked === true }))
                                                }
                                            />
                                            {inst}
                                        </label>
                                    ))}
                                </div>

                                <Button onClick={handleScan} disabled={scanning}>
                                    {scanning ? 'Scanning...' : 'Scan'}
                                </Button>

                                {errors.import && (
                                    <p className="text-sm text-red-500">{errors.import}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">Import Results</h3>

                                {!importDone ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            Found {scanned.total} new contact{scanned.total !== 1 ? 's' : ''}.
                                        </p>

                                        {scanned.errors.length > 0 && (
                                            <div className="text-sm text-red-500">
                                                <p>Scan errors:</p>
                                                <ul className="list-inside list-disc">
                                                    {scanned.errors.map((err, i) => (
                                                        <li key={i}>{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {importing && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Importing...</span>
                                                    <span>{importProgress.done} / {importProgress.total}</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                                        style={{
                                                            width: `${(importProgress.done / importProgress.total) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!importing && scanned.total > 0 && (
                                            <Button onClick={handleImport}>
                                                Import All ({scanned.total})
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <p className="text-green-600">
                                            Imported: {importProgress.done}
                                        </p>
                                        {importErrors.length > 0 && (
                                            <div className="text-red-500">
                                                <p>Errors ({importErrors.length}):</p>
                                                <ul className="list-inside list-disc">
                                                    {importErrors.slice(0, 5).map((err, i) => (
                                                        <li key={i}>{err}</li>
                                                    ))}
                                                    {importErrors.length > 5 && (
                                                        <li>...and {importErrors.length - 5} more</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                        <Link href={adminContactsIndex().url}>
                                            <Button type="button" variant="outline">Back to Contacts</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
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
                                        <Button type="button" onClick={handleFetchFromEvolution} disabled={evoStep !== 'idle'}>
                                            {evoStep === 'idle' ? 'Get' : evoStep === 'done' ? 'Done' : 'Fetching...'}
                                        </Button>
                                    </div>
                                </div>

                                {evoStep !== 'idle' && (
                                    <div className="space-y-2">
                                        {evoStep === 'verifying' && (
                                            <>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Verifying number on WhatsApp...</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full w-[15%] rounded-full bg-primary transition-all duration-500" />
                                                </div>
                                            </>
                                        )}
                                        {evoStep === 'fetching' && (
                                            <>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Fetching profile...</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full w-[50%] rounded-full bg-primary transition-all duration-500" />
                                                </div>
                                            </>
                                        )}
                                        {evoStep === 'downloading' && (
                                            <>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Downloading photo...</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full w-[85%] rounded-full bg-primary transition-all duration-500" />
                                                </div>
                                            </>
                                        )}
                                        {evoStep === 'done' && (
                                            <div className="rounded-lg border border-green-200 p-2 text-sm text-green-600">
                                                <p className="font-medium">✓ Number verified & fetched</p>
                                            </div>
                                        )}
                                        {evoStep === 'error' && (
                                            <div className="rounded-lg border border-red-200 p-2 text-sm text-red-600">
                                                <p className="font-medium">✗ Failed to fetch contact</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.fetch && (
                                    <p className="text-sm text-red-500">{errors.fetch}</p>
                                )}

                                                {values.country && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Country: </span>
                                        <span className="font-medium">{countryFlag(values.country)} {values.country.toUpperCase()}</span>
                                    </div>
                                )}

                                {values.is_business && (
                                    <div className="text-sm">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            Business Account
                                        </span>
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
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Contact'}
                            </Button>
                            <Link href={adminContactsIndex().url}>
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
