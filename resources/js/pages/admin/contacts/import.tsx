import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, countryFlag } from '@/lib/utils';
import { index as adminContactsIndex } from '@/routes/admin/contacts';

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

export default function ContactsImport({ instances, countries }: { instances: string[]; countries: string[] }) {
    const [mode, setMode] = useState<'evolution' | 'import' | 'groups' | 'csv'>('evolution');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
    const [csvImporting, setCsvImporting] = useState(false);
    const [csvProgress, setCsvProgress] = useState<{ done: number; total: number } | null>(null);
    const [csvResult, setCsvResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

    const [evoNumber, setEvoNumber] = useState('');
    const [evoStep, setEvoStep] = useState<'idle' | 'verifying' | 'fetching' | 'downloading' | 'done' | 'error'>('idle');

    const [values, setValues] = useState({
        name: '',
        phone: '',
        whatsapp_id: '',
        country: '',
        is_business: false,
        wa_status: '',
        description: '',
        website: '',
        profile_pic_url: '',
    });

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

    const [groupsScanning, setGroupsScanning] = useState(false);
    const [scannedGroups, setScannedGroups] = useState<ScannedGroup[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<Record<string, boolean>>({});
    const [groupsScanDone, setGroupsScanDone] = useState(false);
    const [groupsStats, setGroupsStats] = useState<{ total_groups: number; total_members: number; new_contacts: number } | null>(null);
    const [groupsImporting, setGroupsImporting] = useState(false);
    const [groupsProgress, setGroupsProgress] = useState({ done: 0, total: 0 });
    const [groupsImportDone, setGroupsImportDone] = useState(false);

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
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ number: evoNumber }),
            });

            flushSync(() => setEvoStep('fetching'));

            if (!res.ok) {
                const data = await res.json();
                flushSync(() => {
 setErrors({ fetch: data.error ?? 'Failed to fetch contact' }); setEvoStep('error'); 
});

                return;
            }

            const data = await res.json();

            if (!data.numberExists || !data.verified) {
                flushSync(() => {
 setErrors({ fetch: 'Number not found on WhatsApp' }); setEvoStep('error'); 
});

                return;
            }

            flushSync(() => setEvoStep('downloading'));
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
                flushSync(() => setErrors({ fetch: `⚠️ This number already exists as "${data.existing_contact.name}" (ID: ${data.existing_contact.id})` }));
            }
        } catch (e) {
            flushSync(() => {
 setErrors({ fetch: 'Network error' }); setEvoStep('error'); 
});
        }
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
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ instances: instancesToScan }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors({ groups: data.error ?? 'Scan failed' });

                return;
            }

            const data = await res.json();
            setScannedGroups(data.groups);
            setGroupsStats({ total_groups: data.total_groups, total_members: data.total_members, new_contacts: data.new_contacts });
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
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
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

    const toggleGroup = (jid: string) => setSelectedGroups((prev) => ({ ...prev, [jid]: !prev[jid] }));

    const picPreview = values.profile_pic_url && !values.profile_pic_url.startsWith('http')
        ? `/storage/${values.profile_pic_url}`
        : values.profile_pic_url;

    const anySelected = Object.values(selectedGroups).some(Boolean);

    const generateCsvTemplate = () => {
        const headers = 'name,phone,email,country,notes';
        const sample = 'Juan Perez,59169375664,juan@email.com,BO,Cliente nuevo';
        const blob = new Blob([`${headers}\n${sample}\n`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contactos_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const CSV_COLUMN_MAP: Record<string, string> = {
        name: 'name',
        nombre: 'name',
        full_name: 'name',
        phone: 'phone',
        celular: 'phone',
        telefono: 'phone',
        teléfono: 'phone',
        mobile: 'phone',
        whatsapp: 'phone',
        email: 'email',
        correo: 'email',
        mail: 'email',
        country: 'country',
        pais: 'country',
        país: 'country',
        notes: 'notes',
        nota: 'notes',
        notas: 'notes',
        note: 'notes',
    };

    const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        e.target.value = '';

        try {
            const text = await file.text();
            const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

            if (lines.length < 2) {
                setErrors({ csv: 'CSV must have a header row and at least one data row' });

                return;
            }

            const rawHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase());

            const headers = rawHeaders.map((h) => CSV_COLUMN_MAP[h] ?? null);

            if (!headers.includes('phone')) {
                setErrors({ csv: 'CSV must include a "phone" or "celular" column' });

                return;
            }

            const rows: Record<string, string>[] = [];

            for (let i = 1; i < lines.length; i++) {
                const vals = lines[i].split(',').map((v) => v.trim());
                const row: Record<string, string> = {};

                for (let j = 0; j < headers.length; j++) {
                    if (headers[j] && vals[j] !== undefined) {
                        row[headers[j]] = vals[j];
                    }
                }

                if (row.phone) {
                    rows.push(row);
                }
            }

            if (rows.length === 0) {
                setErrors({ csv: 'No valid rows found (phone column required)' });

                return;
            }

            setCsvRows(rows);
            setCsvResult(null);
            setErrors({});
        } catch {
            setErrors({ csv: 'Failed to parse CSV file' });
        }
    };

    const handleCsvImport = async () => {
        if (csvRows.length === 0) {
return;
}

        setCsvImporting(true);
        setCsvProgress({ done: 0, total: csvRows.length });
        setCsvResult(null);
        setErrors({});

        const BATCH_SIZE = 10;

        let imported = 0;
        let skipped = 0;
        const errs: string[] = [];

        for (let i = 0; i < csvRows.length; i += BATCH_SIZE) {
            const batch = csvRows.slice(i, i + BATCH_SIZE);

            try {
                const res = await fetch('/admin/contacts/import-csv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ rows: batch }),
                });

                if (res.ok) {
                    const data = await res.json();
                    imported += data.imported;
                    skipped += data.skipped;

                    if (data.errors?.length > 0) {
errs.push(...data.errors);
}
                } else {
                    const data = await res.json();
                    errs.push(`Batch ${i / BATCH_SIZE + 1}: ${data.error ?? 'Import failed'}`);
                }
            } catch {
                errs.push(`Batch ${i / BATCH_SIZE + 1}: network error`);
            }

            setCsvProgress({ done: Math.min(i + BATCH_SIZE, csvRows.length), total: csvRows.length });
        }

        setCsvImporting(false);
        setCsvResult({ imported, skipped, errors: errs });
    };

    return (
        <>
            <Head title="Import Contacts" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Import Contacts"
                    description="Fetch from Evolution API, bulk import, or import from groups"
                />

                <div className="flex flex-wrap gap-1 self-start rounded-lg border bg-muted p-1">
                    {(['evolution', 'import', 'groups', 'csv'] as const).map((m) => (
                        <button
                            key={m}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                mode === m ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                            )}
                            onClick={() => setMode(m)}
                        >
                            {m === 'groups' ? 'From Groups' : m === 'evolution' ? 'From Evolution' : m === 'import' ? 'Bulk Import' : 'CSV'}
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
                                {errors.groups && <p className="text-sm text-red-500">{errors.groups}</p>}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-medium">Groups found</h3>
                                        {groupsStats && (
                                            <span className="text-sm text-muted-foreground">
                                                {groupsStats.total_groups} groups &bull; {groupsStats.total_members} members &bull; <span className="text-green-600">{groupsStats.new_contacts} new contacts</span>
                                            </span>
                                        )}
                                    </div>
                                    {errors.groups && <p className="mb-3 text-sm text-red-500">{errors.groups}</p>}
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
                                                        {g.instance} &bull; {g.participants.length} members
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
                                                style={{ width: `${groupsProgress.total > 0 ? (groupsProgress.done / groupsProgress.total) * 100 : 0}%` }}
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
                                            {importErrors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                                            {importErrors.length > 5 && <li>...and {importErrors.length - 5} more</li>}
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
                                    <Button variant="outline" onClick={() => {
 setGroupsScanDone(false); setScannedGroups([]); 
}}>
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
                                <h3 className="text-sm font-medium">Bulk Import from Evolution</h3>
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
                                {errors.import && <p className="text-sm text-red-500">{errors.import}</p>}
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
                                                    {scanned.errors.map((err, i) => <li key={i}>{err}</li>)}
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
                                                        style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
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
                                        <p className="text-green-600">Imported: {importProgress.done}</p>
                                        {importErrors.length > 0 && (
                                            <div className="text-red-500">
                                                <p>Errors ({importErrors.length}):</p>
                                                <ul className="list-inside list-disc">
                                                    {importErrors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                                                    {importErrors.length > 5 && <li>...and {importErrors.length - 5} more</li>}
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
                ) : mode === 'csv' ? (
                    <div className="max-w-lg space-y-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="text-sm font-medium">Import from CSV</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload a CSV file with your contacts. The <strong>phone</strong> column is required.
                            </p>

                            <Button variant="outline" size="sm" onClick={generateCsvTemplate}>
                                Download CSV Template
                            </Button>

                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                id="csv-file-input"
                                onChange={handleCsvFile}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('csv-file-input')?.click()}
                                disabled={csvImporting}
                            >
                                Select CSV File
                            </Button>

                            {errors.csv && <p className="text-sm text-red-500">{errors.csv}</p>}

                            {csvRows.length > 0 && (
                                <div className="rounded-lg border p-3">
                                    <p className="mb-2 text-sm font-medium">{csvRows.length} contacts found</p>
                                    <div className="max-h-40 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b text-left text-muted-foreground">
                                                    <th className="p-1">Name</th>
                                                    <th className="p-1">Phone</th>
                                                    <th className="p-1">Email</th>
                                                    <th className="p-1">Country</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvRows.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="border-b border-muted/50">
                                                        <td className="p-1">{row.name ?? '—'}</td>
                                                        <td className="p-1 font-mono">{row.phone}</td>
                                                        <td className="p-1">{row.email ?? '—'}</td>
                                                        <td className="p-1">{row.country ?? '—'}</td>
                                                    </tr>
                                                ))}
                                                {csvRows.length > 10 && (
                                                    <tr><td className="p-1 text-muted-foreground" colSpan={4}>...and {csvRows.length - 10} more</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {csvImporting && csvProgress && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Importing...</span>
                                        <span>{csvProgress.done} / {csvProgress.total}</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-300"
                                            style={{ width: `${csvProgress.total > 0 ? (csvProgress.done / csvProgress.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {csvResult && (
                                <div className="space-y-2 text-sm">
                                    <p className="text-green-600">Imported: {csvResult.imported}</p>
                                    {csvResult.skipped > 0 && <p className="text-muted-foreground">Skipped (already exist): {csvResult.skipped}</p>}
                                    {csvResult.errors.length > 0 && (
                                        <div className="text-red-500">
                                            <p>Errors ({csvResult.errors.length}):</p>
                                            <ul className="list-inside list-disc">
                                                {csvResult.errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                                                {csvResult.errors.length > 5 && <li>...and {csvResult.errors.length - 5} more</li>}
                                            </ul>
                                        </div>
                                    )}
                                    <Link href={adminContactsIndex().url}>
                                        <Button type="button" variant="outline">Back to Contacts</Button>
                                    </Link>
                                </div>
                            )}

                            {!csvImporting && !csvResult && csvRows.length > 0 && (
                                <Button onClick={handleCsvImport}>
                                    Import All ({csvRows.length})
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-lg space-y-6">
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

                            {errors.fetch && <p className="text-sm text-red-500">{errors.fetch}</p>}

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

                        {values.phone && (
                            <div className="flex gap-2">
                                <Link href={`/admin/contacts/create?phone=${encodeURIComponent(values.phone)}&name=${encodeURIComponent(values.name)}`}>
                                    <Button>Create Contact with this data</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}