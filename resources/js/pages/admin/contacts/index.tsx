import { Head, Link, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ContactDetailSheet } from '@/components/contacts/contact-detail-sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { batchDestroy as adminContactsBatchDestroy, index as adminContactsIndex } from '@/routes/admin/contacts';
import type { Contact } from '@/types';

const ORDERABLE_COLUMNS = ['id', 'name', 'phone', 'email', 'is_active', 'country', 'created_at'] as const;

type PaginatedResponse = {
    data: (Contact & Record<string, unknown>)[];
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
};

function buildDtParams(page: number, pageLength: number, sort: { column: string; direction: 'asc' | 'desc' }, search: string, filters: Record<string, string>): string {
    const cols: { data: string; name: string; searchable: boolean; orderable: boolean }[]
        = [...ORDERABLE_COLUMNS.map((col) => ({
            data: col,
            name: '',
            searchable: true,
            orderable: true,
        })), { data: 'action', name: '', searchable: false, orderable: false }];

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

    Object.entries(filters).forEach(([k, v]) => {
        if (v) {
            params.set(`filters[${k}]`, v);
        }
    });

    return params.toString();
}

export default function ContactsIndex({ countries }: { countries: string[] }) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({
        country: '',
        type: '',
        is_active: '',
        is_business: '',
    });
    const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
        column: 'id',
        direction: 'desc',
    });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filtered, setFiltered] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pageLength, setPageLength] = useState(10);
    const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
    const openDetail = useCallback((id: number) => setSelectedContactId(id), []);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const selectAllRef = useRef<HTMLInputElement>(null);
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

    const { confirm, dialogProps } = useConfirmDialog();

    const allSelectedOnPage = contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));
    const someSelectedOnPage = contacts.some((c) => selectedIds.includes(c.id));

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = someSelectedOnPage && !allSelectedOnPage;
        }
    }, [someSelectedOnPage, allSelectedOnPage]);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleSelectAll = () => {
        if (allSelectedOnPage) {
            setSelectedIds((prev) => prev.filter((i) => !contacts.some((c) => c.id === i)));
        } else {
            setSelectedIds((prev) => {
                const currentIds = new Set(prev);
                contacts.forEach((c) => currentIds.add(c.id));

                return Array.from(currentIds);
            });
        }
    };

    const handleBatchDelete = () => {
        confirm(
            () => {
                router.post(adminContactsBatchDestroy().url, { ids: selectedIds }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                        setPage(1);
                        setRefreshKey((k) => k + 1);
                    },
                });
            },
            'Delete Contacts',
            `Are you sure you want to delete ${selectedIds.length} contact(s)?`,
        );
    };

    useEffect(() => {
        const qs = buildDtParams(page, pageLength, sort, search, filters);
        const controller = new AbortController();

        fetch(`${adminContactsIndex().url}?${qs}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            signal: controller.signal,
        })
            .then((res) => res.json() as Promise<PaginatedResponse>)
            .then((json) => {
                setContacts(json.data);
                setTotal(json.recordsTotal);
                setFiltered(json.recordsFiltered);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [page, pageLength, search, sort, filters, refreshKey]);

    const handleSort = (column: string) => {
        setSort((prev) => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleDelete = (contactId: number, contactName: string | null) => {
        confirm(
            () => {
                router.delete(`/admin/contacts/${contactId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setPage(1);
                        setRefreshKey((k) => k + 1);
                    },
                });
            },
            'Delete Contact',
            `Are you sure you want to delete "${contactName ?? 'this contact'}"?`,
        );
    };

    const columnLabel: Record<string, string> = {
        id: 'ID',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        is_active: 'Active',
        country: 'Country',
        type: 'Type',
        created_at: 'Created',
    };

    const COLUMNS: { key: string; render: (c: Contact) => React.ReactNode }[] = [
        {
            key: 'id',
            render: (contact) => <>{contact.id}</>,
        },
        {
            key: 'name',
            render: (contact) => (
                <div className="flex items-center gap-2">
                    {contact.profile_pic_url ? (
                        <img
                            src={contact.profile_pic_url}
                            alt={contact.name ?? 'Avatar'}
                            referrerPolicy="no-referrer"
                            className="size-8 rounded-full border object-cover"
                        />
                    ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                            {(contact.name ?? '?')[0]}
                        </div>
                    )}
                    {contact.name ?? '—'}
                </div>
            ),
        },
        {
            key: 'phone',
            render: (contact) => <>{contact.phone ?? '—'}</>,
        },
        {
            key: 'email',
            render: (contact) => <>{contact.email ?? '—'}</>,
        },
        {
            key: 'is_active',
            render: (contact) => (
                contact.is_active ? (
                    <span className="text-green-600">Yes</span>
                ) : (
                    <span className="text-muted-foreground">No</span>
                )
            ),
        },
        {
            key: 'country',
            render: (contact) => (
                contact.country
                    ? <span className="font-medium uppercase">{contact.country}</span>
                    : '—'
            ),
        },
        {
            key: 'created_at',
            render: (contact) => (
                <>{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '—'}</>
            ),
        },
    ];

    const visibleColumns = ORDERABLE_COLUMNS.filter((col) => !hiddenColumns.has(col));
    const visibleColCount = 1 + visibleColumns.length + 1;
const totalPages = Math.ceil(filtered / pageLength); // checkbox + visible + type

    return (
        <>
            <Head title="Contacts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="max-w-xs pr-8"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
 setSearch(''); setPage(1); 
}}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>
                    <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={filters.country}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, country: e.target.value }));
                            setPage(1);
                        }}
                    >
                        <option value="">All Countries</option>
                        {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={filters.type}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, type: e.target.value }));
                            setPage(1);
                        }}
                    >
                        <option value="">All Types</option>
                        <option value="individual">Individual</option>
                        <option value="group">Group</option>
                    </select>
                    <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={filters.is_active}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, is_active: e.target.value }));
                            setPage(1);
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                    <select
                        className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        value={filters.is_business}
                        onChange={(e) => {
                            setFilters((prev) => ({ ...prev, is_business: e.target.value }));
                            setPage(1);
                        }}
                    >
                        <option value="">WhatsApp: All</option>
                        <option value="1">Business</option>
                        <option value="0">Normal</option>
                    </select>
                    {(filters.country || filters.type || filters.is_active || filters.is_business) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilters({ country: '', type: '', is_active: '', is_business: '' });
                                setPage(1);
                            }}
                        >
                            Clear
                        </Button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs">
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                {ORDERABLE_COLUMNS.map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col}
                                        checked={!hiddenColumns.has(col)}
                                        onCheckedChange={(checked) => {
                                            setHiddenColumns((prev) => {
                                                const next = new Set(prev);

                                                if (checked) {
next.delete(col);
} else {
next.add(col);
}

                                                return next;
                                            });
                                        }}
                                    >
                                        {columnLabel[col]}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2 text-sm">
                        <span className="font-medium">{selectedIds.length} selected</span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBatchDelete}
                        >
                            Delete Selected
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIds([])}
                        >
                            Clear
                        </Button>
                    </div>
                )}

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        ref={selectAllRef}
                                        type="checkbox"
                                        checked={allSelectedOnPage}
                                        onChange={toggleSelectAll}
                                        className="size-4"
                                    />
                                </TableHead>
                                {ORDERABLE_COLUMNS.filter((col) => !hiddenColumns.has(col)).map((col) => (
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
                                <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        No contacts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.map((contact) => (
                                    <TableRow
                                        key={contact.id}
                                        className="cursor-pointer"
                                        onClick={() => openDetail(contact.id)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(contact.id)}
                                                onChange={() => toggleSelect(contact.id)}
                                                className="size-4"
                                            />
                                        </TableCell>
                                        {visibleColumns.map((col) => {
                                            const colDef = COLUMNS.find((c) => c.key === col);

                                            return (
                                                <TableCell key={col}>
                                                    {colDef ? colDef.render(contact) : null}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {contact.type === 'group' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        Group
                                                        {contact.participant_count != null && ` (${contact.participant_count})`}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Individual
                                                    </span>
                                                )}
                                                {contact.is_business && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Business
                                                    </span>
                                                )}
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
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage(1)}
                            className="px-2"
                        >
                            &laquo;
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages > 5 ? 5 : totalPages }, (_, i) => {
                            let pageNum: number;

                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={pageNum === page ? 'default' : 'outline'}
                                    size="sm"
                                    className="px-2"
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage(totalPages)}
                            className="px-2"
                        >
                            &raquo;
                        </Button>
                    </div>
                </div>
            </div>

            <ContactDetailSheet
                contactId={selectedContactId}
                onClose={() => setSelectedContactId(null)}
            />
            <ConfirmDialog {...dialogProps} />
        </>
    );
}
