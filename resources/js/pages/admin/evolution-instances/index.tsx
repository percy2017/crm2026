import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { index as evolutionInstancesIndex } from '@/routes/admin/evolution-instances';
import type { EvolutionInstance, EvolutionWebhook } from '@/types';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    open: { label: 'Connected', variant: 'default' },
    connecting: { label: 'Connecting', variant: 'secondary' },
    close: { label: 'Disconnected', variant: 'destructive' },
    pending: { label: 'Pending', variant: 'outline' },
};

const ORDERABLE_COLUMNS = ['id', 'instance', 'event', 'created_at'] as const;

type PaginatedResponse = {
    data: (EvolutionWebhook & Record<string, unknown>)[];
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
};

function formatJid(jid: string | null): string {
    if (!jid) return '—';

    const number = jid.split('@')[0];

    if (number.length >= 8) {
        return `+${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }

    return `+${number}`;
}

function formatCount(n: number): string {
    if (n >= 1000) {
        return `${(n / 1000).toFixed(1)}k`;
    }

    return String(n);
}

function buildDtParams(page: number, pageLength: number, search: string): string {
    const cols = ORDERABLE_COLUMNS.map((col) => ({
        data: col,
        name: '',
        searchable: col !== 'created_at',
        orderable: true,
    }));

    const params = new URLSearchParams();
    params.set('draw', String(Date.now()));
    params.set('start', String((page - 1) * pageLength));
    params.set('length', String(pageLength));

    cols.forEach((col, i) => {
        Object.entries(col).forEach(([k, v]) => {
            params.set(`columns[${i}][${k}]`, String(v));
        });
    });

    params.set('order[0][column]', '0');
    params.set('order[0][dir]', 'desc');

    if (search) {
        params.set('search[value]', search);
        params.set('search[regex]', 'false');
    }

    return params.toString();
}

function WebhookRow({ webhook }: { webhook: EvolutionWebhook }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <TableRow className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <TableCell className="text-xs text-muted-foreground">{webhook.id}</TableCell>
                <TableCell>{webhook.instance ?? '—'}</TableCell>
                <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{webhook.event ?? '—'}</code>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{webhook.created_at}</TableCell>
                <TableCell>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
                        {expanded ? 'Collapse' : 'Expand'}
                    </Button>
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow>
                    <TableCell colSpan={5} className="p-0">
                        <pre className="max-h-96 overflow-auto bg-muted p-4 text-xs leading-relaxed">
                            {JSON.stringify(webhook.payload, null, 2)}
                        </pre>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export default function EvolutionInstancesIndex({ instances }: { instances: EvolutionInstance[] }) {
    const [webhooks, setWebhooks] = useState<EvolutionWebhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filtered, setFiltered] = useState(0);
    const [tab, setTab] = useState('instances');
    const pageLength = 25;

    useEffect(() => {
        if (tab !== 'webhooks') {
            return;
        }

        const qs = buildDtParams(page, pageLength, search);
        const controller = new AbortController();

        setLoading(true);

        fetch(`${evolutionInstancesIndex().url}?${qs}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            signal: controller.signal,
        })
            .then((res) => res.json() as Promise<PaginatedResponse>)
            .then((json) => {
                setWebhooks(json.data);
                setTotal(json.recordsTotal);
                setFiltered(json.recordsFiltered);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [tab, page, search]);

    const totalPages = Math.ceil(filtered / pageLength);

    return (
        <>
            <Head title="Evolution Instances" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                <div className="flex gap-1 rounded-lg border bg-muted p-1">
                    <button
                        className={cn(
                            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            tab === 'instances' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                        )}
                        onClick={() => { setTab('instances'); setPage(1); setSearch(''); }}
                    >
                        Instances
                    </button>
                    <button
                        className={cn(
                            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            tab === 'webhooks' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                        )}
                        onClick={() => { setTab('webhooks'); setPage(1); setSearch(''); }}
                    >
                        Webhook Log
                    </button>
                </div>

                {tab === 'instances' && (
                    <div className="mt-4">
                        {instances.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                                <span className="text-lg font-medium">No instances found</span>
                                <p className="text-sm">
                                    Create instances directly in Evolution API to see them here.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {instances.map((instance) => {
                                    const status = STATUS_MAP[instance.connectionStatus] ?? STATUS_MAP.pending;

                                    return (
                                        <Card key={instance.id} className="overflow-hidden">
                                            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {instance.name}
                                                    </span>
                                                </div>
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </CardHeader>

                                            <CardContent className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <span>{formatJid(instance.ownerJid)}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <span>{instance.profileName ?? '—'}</span>
                                                </div>

                                                {instance.profilePicUrl && (
                                                    <div className="pt-1">
                                                        <img
                                                            src={instance.profilePicUrl}
                                                            alt={instance.profileName ?? 'Profile'}
                                                            className="size-12 rounded-full border object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
                                                    <span>{formatCount(instance._count.Message)} msgs</span>
                                                    <span>{formatCount(instance._count.Contact)} contacts</span>
                                                    <span>{formatCount(instance._count.Chat)} chats</span>
                                                </div>

                                                <div className="pt-1 text-xs text-muted-foreground">
                                                    Created {new Date(instance.createdAt).toLocaleDateString()}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'webhooks' && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search by instance or event..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="max-w-sm"
                            />
                            <span className="text-sm text-muted-foreground">
                                {filtered} of {total} webhooks
                            </span>
                        </div>

                        <div className="mt-4 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Instance</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Received</TableHead>
                                        <TableHead>Payload</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : webhooks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No webhooks received yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        webhooks.map((webhook) => (
                                            <WebhookRow key={webhook.id} webhook={webhook} />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
