import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, Trash2, Users } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { index as adminRolesIndex } from '@/routes/admin/roles';

type SortDirection = 'asc' | 'desc';

type SortConfig = {
    column: string;
    direction: SortDirection;
};

const ORDERABLE_COLUMNS = ['id', 'name', 'permissions', 'created_at'] as const;

type PaginatedResponse = {
    data: {
        id: number;
        name: string;
        permissions: string;
        users_count: number;
        created_at: string;
        action: string;
    }[];
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
            { data: 'users_count', name: '', searchable: false, orderable: true },
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

export default function RolesIndex({
    permissions,
}: {
    permissions: string[];
}) {
    const [roles, setRoles] = useState<PaginatedResponse['data']>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortConfig>({ column: 'id', direction: 'asc' });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filtered, setFiltered] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pageLength, setPageLength] = useState(10);

    const [viewRole, setViewRole] = useState<PaginatedResponse['data'][number] | null>(null);

    const [editRole, setEditRole] = useState<PaginatedResponse['data'][number] | null>(null);
    const [editName, setEditName] = useState('');
    const [editPerms, setEditPerms] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createPerms, setCreatePerms] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);

    const { confirm, dialogProps } = useConfirmDialog();

    const fetchRoles = () => {
        setLoading(true);
        const qs = buildDtParams(page, pageLength, sort, search);
        const controller = new AbortController();

        fetch(`${adminRolesIndex().url}?${qs}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            signal: controller.signal,
        })
            .then((res) => res.json() as Promise<PaginatedResponse>)
            .then((json) => {
                setRoles(json.data);
                setTotal(json.recordsTotal);
                setFiltered(json.recordsFiltered);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    };

    useEffect(() => {
        const cleanup = fetchRoles();
        return cleanup;
    }, [page, pageLength, search, sort, refreshKey]);

    const totalPages = Math.ceil(filtered / pageLength);

    const handleSort = (column: string) => {
        setSort((prev) => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const openView = (role: PaginatedResponse['data'][number]) => {
        setViewRole(role);
    };

    const openEdit = (role: PaginatedResponse['data'][number]) => {
        setEditRole(role);
        setEditName(role.name);
        const perms = role.permissions ? role.permissions.split(', ').filter(Boolean) : [];
        setEditPerms(perms);
    };

    const handleSave = async () => {
        if (!editRole) return;
        setSaving(true);
        try {
            const res = await fetch(adminRolesIndex().url + '/' + editRole.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name: editName, permissions: editPerms }),
            });
            if (res.ok) {
                setEditRole(null);
                setRefreshKey((k) => k + 1);
            }
        } catch {
            /* ignore */
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async () => {
        if (!createName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch(adminRolesIndex().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ name: createName, permissions: createPerms }),
            });
            if (res.ok) {
                setShowCreate(false);
                setCreateName('');
                setCreatePerms([]);
                setRefreshKey((k) => k + 1);
            }
        } catch {
            /* ignore */
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = (role: PaginatedResponse['data'][number]) => {
        confirm(
            async () => {
                const res = await fetch(adminRolesIndex().url + '/' + role.id, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                        Accept: 'application/json',
                    },
                });
                if (res.ok) {
                    setRefreshKey((k) => k + 1);
                }
            },
            'Delete Role',
            `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
        );
    };

    const columnLabel: Record<string, string> = {
        id: 'ID',
        name: 'Name',
        permissions: 'Permissions',
        created_at: 'Created',
    };

    return (
        <>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Roles"
                        description="Manage user roles and permissions"
                    />
                    <Button onClick={() => setShowCreate(true)}>
                        Create Role
                    </Button>
                </div>

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
                                <TableHead>Users</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No roles found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>{role.id}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="size-4 text-muted-foreground" />
                                                {role.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions && role.permissions !== '—' ? (
                                                    role.permissions.split(', ').map((p) => (
                                                        <Badge key={p} variant="secondary" className="text-xs">
                                                            {p}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Users className="size-3.5 text-muted-foreground" />
                                                {role.users_count}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {role.created_at
                                                ? new Date(role.created_at).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openView(role)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(role)}
                                                    disabled={role.name === 'admin'}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(role)}
                                                    disabled={role.name === 'admin'}
                                                >
                                                    <Trash2 className="size-4" />
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

            <Sheet open={viewRole !== null} onOpenChange={(o) => { if (!o) setViewRole(null); }}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Role Details</SheetTitle>
                        <SheetDescription>
                            View role information and assigned permissions.
                        </SheetDescription>
                    </SheetHeader>

                    {viewRole && (
                        <div className="mt-6 space-y-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                    Name
                                </label>
                                <p className="text-lg font-semibold">{viewRole.name}</p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                    Users with this role
                                </label>
                                <p className="flex items-center gap-1 text-sm">
                                    <Users className="size-4" />
                                    {viewRole.users_count}
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                                    Permissions
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {viewRole.permissions && viewRole.permissions !== '—' ? (
                                        viewRole.permissions.split(', ').map((p) => (
                                            <Badge key={p} variant="secondary">{p}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No permissions assigned.</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                    Created
                                </label>
                                <p className="text-sm">
                                    {viewRole.created_at
                                        ? new Date(viewRole.created_at).toLocaleString()
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={editRole !== null} onOpenChange={(o) => { if (!o) setEditRole(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            {editRole?.name === 'admin'
                                ? 'The admin role name and permissions cannot be modified.'
                                : 'Update the role name and assign permissions.'}
                        </DialogDescription>
                    </DialogHeader>

                    {editRole && (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Role Name</label>
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    disabled={editRole.name === 'admin'}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Permissions</label>
                                <div className="max-h-60 space-y-2 overflow-y-auto">
                                    {permissions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No permissions available.
                                        </p>
                                    ) : (
                                        permissions.map((perm) => (
                                            <label
                                                key={perm}
                                                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
                                            >
                                                <Checkbox
                                                    checked={editPerms.includes(perm)}
                                                    onCheckedChange={() => {
                                                        setEditPerms((prev) =>
                                                            prev.includes(perm)
                                                                ? prev.filter((p) => p !== perm)
                                                                : [...prev, perm],
                                                        );
                                                    }}
                                                    disabled={editRole.name === 'admin'}
                                                />
                                                <Shield className="size-3.5 text-muted-foreground" />
                                                {perm}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditRole(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={editRole?.name === 'admin' || saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreate} onOpenChange={(o) => { if (!o) { setShowCreate(false); setCreateName(''); setCreatePerms([]); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Role</DialogTitle>
                        <DialogDescription>
                            Create a new role and assign permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Role Name</label>
                            <Input
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                placeholder="e.g. editor"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Permissions</label>
                            <div className="max-h-60 space-y-2 overflow-y-auto">
                                {permissions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No permissions available.
                                    </p>
                                ) : (
                                    permissions.map((perm) => (
                                        <label
                                            key={perm}
                                            className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
                                        >
                                            <Checkbox
                                                checked={createPerms.includes(perm)}
                                                onCheckedChange={() => {
                                                    setCreatePerms((prev) =>
                                                        prev.includes(perm)
                                                            ? prev.filter((p) => p !== perm)
                                                            : [...prev, perm],
                                                    );
                                                }}
                                            />
                                            <Shield className="size-3.5 text-muted-foreground" />
                                            {perm}
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => { setShowCreate(false); setCreateName(''); setCreatePerms([]); }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!createName.trim() || creating}
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
