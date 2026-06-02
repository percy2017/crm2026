import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { DealDetailSheet } from '@/pages/admin/deals/components/deal-detail-sheet';
import { DealFormDialog } from '@/pages/admin/deals/components/deal-form-dialog';
import { KanbanBoard } from '@/pages/admin/deals/components/kanban-board';
import { ManageStagesDialog } from '@/pages/admin/deals/components/manage-stages-dialog';
import { index as adminDealsIndex } from '@/routes/admin/deals';
import type { Contact } from '@/types';

type Stage = {
    id: number;
    name: string;
    order: number;
    color: string | null;
    deals: DealData[];
};

type Pipeline = {
    id: number;
    name: string;
    stages: Stage[];
};

type DealData = {
    id: number;
    pipeline_id: number;
    stage_id: number;
    contact_id: number | null;
    title: string;
    value: string;
    assigned_to: number | null;
    expected_close_date: string | null;
    probability: number | null;
    status: string;
    lost_reason: string | null;
    closed_at: string | null;
    notes: string | null;
    created_at: string;
    contact: { id: number; name: string; phone: string; profile_pic_url: string | null } | null;
    assigned_user: { id: number; name: string; email: string } | null;
};

type User = { id: number; name: string; email: string };

type SortDirection = 'asc' | 'desc';

type SortConfig = {
    column: string;
    direction: SortDirection;
};

const ORDERABLE_COLUMNS = ['id', 'title', 'value', 'status', 'created_at'] as const;

type PaginatedResponse = {
    data: (DealData & Record<string, unknown>)[];
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
};

function buildDtParams(page: number, pageLength: number, sort: SortConfig, search: string): string {
    const cols: { data: string; name: string; searchable: boolean; orderable: boolean }[]
        = [...ORDERABLE_COLUMNS.map((col) => ({
            data: col,
            name: '',
            searchable: true,
            orderable: true,
        })), ...[
            { data: 'stage_name', name: '', searchable: true, orderable: false },
            { data: 'contact_name', name: '', searchable: true, orderable: false },
            { data: 'assigned_name', name: '', searchable: true, orderable: false },
            { data: 'action', name: '', searchable: false, orderable: false },
        ]];

    const order = [
        {
            column: ORDERABLE_COLUMNS.indexOf(sort.column as typeof ORDERABLE_COLUMNS[number]),
            dir: sort.direction,
        },
    ];

    const params = new URLSearchParams();
    params.set('draw', String(Date.now()));
    params.set('start', String((page - 1) * pageLength));
    params.set('length', String(pageLength));

    cols.forEach((col, i) => {
        Object.entries(col).forEach(([k, v]) => {
            params.set(`columns[${i}][${k}]`, String(v));
        });
    });

    order.forEach((o, i) => {
        Object.entries(o).forEach(([k, v]) => {
            params.set(`order[${i}][${k}]`, String(v));
        });
    });

    if (search) {
        params.set('search[value]', search);
        params.set('search[regex]', 'false');
    }

    return params.toString();
}

export default function DealsIndex({
    pipeline: initialPipeline,
    contacts,
    users,
}: {
    pipeline: Pipeline | null;
    contacts: { id: number; name: string; phone: string; profile_pic_url: string | null }[];
    users: User[];
}) {
    const [view, setView] = useState<'kanban' | 'table'>('kanban');
    const [pipeline, setPipeline] = useState<Pipeline | null>(initialPipeline);

    const [deals, setDeals] = useState<DealData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortConfig>({ column: 'id', direction: 'asc' });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filtered, setFiltered] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pageLength, setPageLength] = useState(10);

    const [showCreate, setShowCreate] = useState(false);
    const [editingDeal, setEditingDeal] = useState<DealData | null>(null);
    const [viewDeal, setViewDeal] = useState<DealData | null>(null);
    const [detailDeal, setDetailDeal] = useState<DealData | null>(null);
    const [showManageStages, setShowManageStages] = useState(false);

    const { confirm, dialogProps } = useConfirmDialog();

    const fetchKanban = useCallback(() => {
        fetch(`${adminDealsIndex().url}?kanban=1`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (json?.pipeline) {
setPipeline(json.pipeline);
}
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (view !== 'table') {
return;
}

        setLoading(true);
        const qs = buildDtParams(page, pageLength, sort, search);
        const controller = new AbortController();

        fetch(`${adminDealsIndex().url}?${qs}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            signal: controller.signal,
        })
            .then((res) => res.json() as Promise<PaginatedResponse>)
            .then((json) => {
                setDeals(json.data);
                setTotal(json.recordsTotal);
                setFiltered(json.recordsFiltered);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [page, pageLength, search, sort, refreshKey, view]);

    const totalPages = Math.ceil(filtered / pageLength);

    const handleSort = (column: string) => {
        setSort((prev) => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleDragEnd = async (dealId: number, targetStageId: number) => {
        const res = await fetch(`${adminDealsIndex().url}/${dealId}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({ stage_id: targetStageId }),
        });

        if (res.ok) {
            fetchKanban();
        }
    };

    const handleStagesChanged = () => {
        fetchKanban();
    };

    const handleDelete = (deal: DealData) => {
        confirm(
            async () => {
                const res = await fetch(`${adminDealsIndex().url}/${deal.id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                        Accept: 'application/json',
                    },
                });

                if (res.ok) {
                    if (viewDeal?.id === deal.id) {
setViewDeal(null);
}

                    setRefreshKey((k) => k + 1);
                    fetchKanban();
                }
            },
            'Delete Deal',
            `Are you sure you want to delete "${deal.title}"?`,
        );
    };

    const columnLabel: Record<string, string> = {
        id: 'ID',
        title: 'Title',
        value: 'Value',
        status: 'Status',
        created_at: 'Created',
    };

    return (
        <>
            <Head title="Deals" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Deals"
                        description={pipeline?.name ?? 'Sales pipeline'}
                    />
                    <div className="flex items-center gap-2">
                        <div className="flex overflow-hidden rounded-md border">
                            <Button
                                variant={view === 'kanban' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none"
                                onClick={() => setView('kanban')}
                            >
                                Kanban
                            </Button>
                            <Button
                                variant={view === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                className="rounded-none"
                                onClick={() => setView('table')}
                            >
                                Table
                            </Button>
                        </div>
                        <Button variant="outline" onClick={() => setShowManageStages(true)}>
                            Stages
                        </Button>
                        <Button onClick={() => setShowCreate(true)}>
                            Create Deal
                        </Button>
                    </div>
                </div>

                {view === 'kanban' && pipeline && (
                    <KanbanBoard
                        pipeline={pipeline}
                        onDragEnd={handleDragEnd}
                        onCardClick={(deal) => setViewDeal(deal)}
                    />
                )}

                {view === 'table' && (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Show</span>
                                <select
                                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                                    value={pageLength}
                                    onChange={(e) => {
                                        setPageLength(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span className="text-sm text-muted-foreground">entries</span>
                            </div>
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="max-w-sm"
                            />
                        </div>

                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {ORDERABLE_COLUMNS.map((col) => (
                                            <TableHead
                                                key={col}
                                                className="cursor-pointer"
                                                onClick={() => handleSort(col)}
                                            >
                                                {columnLabel[col]}{' '}
                                                {sort.column === col &&
                                                    (sort.direction === 'asc' ? '↑' : '↓')}
                                            </TableHead>
                                        ))}
                                        <TableHead>Stage</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Assigned</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : deals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center">
                                                No deals found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        deals.map((deal) => (
                                            <TableRow key={deal.id}>
                                                <TableCell>{deal.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    {deal.title}
                                                </TableCell>
                                                <TableCell>${deal.value}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            deal.status === 'won'
                                                                ? 'success'
                                                                : deal.status === 'lost'
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                        }
                                                    >
                                                        {deal.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {deal.created_at
                                                        ? new Date(deal.created_at).toLocaleDateString()
                                                        : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {deal.stage_name as string}
                                                </TableCell>
                                                <TableCell>
                                                    {deal.contact_name as string}
                                                </TableCell>
                                                <TableCell>
                                                    {deal.assigned_name as string}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setViewDeal(deal)}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingDeal(deal);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(deal)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {filtered === 0
                                    ? 'No entries'
                                    : `Showing ${(page - 1) * pageLength + 1} to ${Math.min(page * pageLength, filtered)} of ${filtered} entries${filtered !== total ? ` (filtered from ${total} total entries)` : ''}`
                                }
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)} className="px-2">&laquo;</Button>
                                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                                {Array.from({ length: totalPages > 5 ? 5 : totalPages }, (_, i) => {
                                    let pn: number;

                                    if (totalPages <= 5) {
pn = i + 1;
} else if (page <= 3) {
pn = i + 1;
} else if (page >= totalPages - 2) {
pn = totalPages - 4 + i;
} else {
pn = page - 2 + i;
}

                                    return (
                                        <Button key={pn} variant={pn === page ? 'default' : 'outline'} size="sm" className="px-2" onClick={() => setPage(pn)}>
                                            {pn}
                                        </Button>
                                    );
                                })}
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-2">&raquo;</Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <DealFormDialog
                open={showCreate}
                deal={null}
                pipeline={pipeline}
                contacts={contacts}
                users={users}
                onClose={() => setShowCreate(false)}
                onSaved={() => {
                    setShowCreate(false);
                    setRefreshKey((k) => k + 1);
                    fetchKanban();
                }}
            />

            <DealFormDialog
                open={editingDeal !== null}
                deal={editingDeal}
                pipeline={pipeline}
                contacts={contacts}
                users={users}
                onClose={() => setEditingDeal(null)}
                onSaved={() => {
                    setEditingDeal(null);
                    setRefreshKey((k) => k + 1);
                    fetchKanban();
                }}
            />

            <DealDetailSheet
                dealId={viewDeal?.id ?? null}
                onClose={() => setViewDeal(null)}
                onEdit={(deal) => {
                    setViewDeal(null);
                    setEditingDeal(deal);
                }}
                onDeleted={(deal) => {
                    setViewDeal(null);
                    setRefreshKey((k) => k + 1);
                    fetchKanban();
                }}
            />

            <ManageStagesDialog
                open={showManageStages}
                onClose={() => setShowManageStages(false)}
                onSaved={handleStagesChanged}
            />

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
