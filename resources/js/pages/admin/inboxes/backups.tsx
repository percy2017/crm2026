import { Head, router } from '@inertiajs/react';
import { Download, Trash2, Archive, HardDrive, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type BackupItem = {
    filename: string;
    inbox: string;
    created_at: string | null;
    size: number;
    size_formatted: string;
};

type InboxOption = {
    id: number;
    name: string;
};

type Props = {
    backups: BackupItem[];
    inboxes: InboxOption[];
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
return '—';
}

    const parts = dateStr.split('_');

    if (parts.length !== 2) {
return dateStr;
}

    const [date, time] = parts;
    const y = date.slice(0, 4);
    const m = date.slice(4, 6);
    const d = date.slice(6, 8);
    const h = time.slice(0, 2);
    const min = time.slice(2, 4);

    return `${d}/${m}/${y} ${h}:${min}`;
}

export default function BackupsIndex({ backups, inboxes }: Props) {
    const [backingUp, setBackingUp] = useState<string | null>(null);
    const [selectedInboxName, setSelectedInboxName] = useState('');

    function generateBackup() {
        if (!selectedInboxName) {
return;
}

        setBackingUp(selectedInboxName);
        const inbox = inboxes.find((i) => i.name === selectedInboxName);

        if (!inbox) {
return;
}

        fetch(`/admin/inboxes/backup/${inbox.id}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
 toast.error(data.error);

 return; 
}

                toast.success('Backup generado');
                router.reload({ only: ['backups'] });
            })
            .catch(() => toast.error('Error al generar backup'))
            .finally(() => setBackingUp(null));
    }

    function deleteBackup(filename: string) {
        if (!confirm(`¿Eliminar backup "${filename}"?`)) {
return;
}

        fetch(`/admin/inboxes/backups/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
            },
        })
            .then((res) => res.json())
            .then(() => {
                toast.success('Backup eliminado');
                router.reload({ only: ['backups'] });
            })
            .catch(() => toast.error('Error al eliminar backup'));
    }

    return (
        <>
            <Head title="Backups de Inboxes" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading title="Backups" description="Gestiona los backups de tus inboxes" />

                <div className="flex items-center gap-2">
                    <select
                        value={selectedInboxName}
                        onChange={(e) => setSelectedInboxName(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                    >
                        <option value="">Seleccionar inbox...</option>
                        {inboxes.map((inb) => (
                            <option key={inb.id} value={inb.name}>{inb.name}</option>
                        ))}
                    </select>
                    <Button onClick={generateBackup} disabled={!selectedInboxName || backingUp !== null}>
                        {backingUp ? 'Generando...' : 'Generar Backup'}
                    </Button>
                </div>

                {backups.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                        <Archive className="size-12" />
                        <p className="text-lg font-medium">No hay backups</p>
                        <p className="text-sm">Genera un backup desde la sección Inboxes o desde aquí abajo.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {backups.map((b) => (
                            <div
                                key={b.filename}
                                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
                            >
                                <Archive className="size-5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{b.filename}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {b.inbox} · {formatDate(b.created_at)} · {b.size_formatted}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="size-8" asChild>
                                        <a
                                            href={`/admin/inboxes/backups/${encodeURIComponent(b.filename)}/download`}
                                            download
                                        >
                                            <Download className="size-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-destructive"
                                        onClick={() => deleteBackup(b.filename)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}