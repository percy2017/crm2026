import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Mail, ShieldCheck, Verified } from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
    create as adminUsersCreate,
    destroy as adminUsersDestroy,
    index as adminUsersIndex,
} from '@/routes/admin/users';
import type { User } from '@/types';

type SortDirection = 'asc' | 'desc';

type SortConfig = {
    column: string;
    direction: SortDirection;
};

const ORDERABLE_COLUMNS = ['id', 'name', 'email', 'roles', 'email_verified_at', 'created_at'] as const;

type PaginatedResponse = {
    data: (User & Record<string, unknown>)[];
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

    return params.toString();
}

export default function UsersIndex() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortConfig>({
        column: 'id',
        direction: 'asc',
    });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filtered, setFiltered] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pageLength, setPageLength] = useState(10);
    const [viewUser, setViewUser] = useState<(User & { roles?: string }) | null>(null);

    useEffect(() => {
        const qs = buildDtParams(page, pageLength, sort, search);
        const controller = new AbortController();

        fetch(`${adminUsersIndex().url}?${qs}`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            signal: controller.signal,
        })
            .then((res) => res.json() as Promise<PaginatedResponse>)
            .then((json) => {
                setUsers(json.data);
                setTotal(json.recordsTotal);
                setFiltered(json.recordsFiltered);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [page, pageLength, search, sort, refreshKey]);
     

    const totalPages = Math.ceil(filtered / pageLength);

    const handleSort = (column: string) => {
        setSort((prev) => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleDelete = (userId: number, userName: string) => {
        if (!confirm(`Are you sure you want to delete "${userName}"?`)) {
            return;
        }

        router.delete(adminUsersDestroy(userId).url, {
            preserveScroll: true,
            onSuccess: () => {
                setPage(1);
                setRefreshKey((k) => k + 1);
            },
        });
    };

    const columnLabel: Record<string, string> = {
        id: 'ID',
        name: 'Name',
        email: 'Email',
        roles: 'Roles',
        email_verified_at: 'Verified',
        created_at: 'Created',
    };

    return (
        <>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Users"
                        description="Manage all registered users"
                    />

                    <Link href={adminUsersCreate().url}>
                        <Button>Create User</Button>
                    </Link>
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
                                {ORDERABLE_COLUMNS.map(
                                    (col) => (
                                        <TableHead
                                            key={col}
                                            className="cursor-pointer"
                                            onClick={() => handleSort(col)}
                                        >
                                            {columnLabel[col]}{' '}
                                            {sort.column === col &&
                                                (sort.direction === 'asc'
                                                    ? '↑'
                                                    : '↓')}
                                        </TableHead>
                                    ),
                                )}
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
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.roles ? String(user.roles) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.email_verified_at ?? (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.created_at
                                                ? new Date(
                                                      user.created_at,
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setViewUser(user)}
                                                >
                                                    View
                                                </Button>
                                                <Link
                                                    href={`/admin/users/${user.id}/edit`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(
                                                            user.id,
                                                            user.name,
                                                        )
                                                    }
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

            <Sheet open={viewUser !== null} onOpenChange={(o) => {
 if (!o) {
setViewUser(null);
} 
}}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>User Details</SheetTitle>
                        <SheetDescription>
                            View user information and account details.
                        </SheetDescription>
                    </SheetHeader>

                    {viewUser && (
                        <div className="mt-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarImage src={viewUser.avatar} alt={viewUser.name} />
                                    <AvatarFallback className="text-lg">
                                        {viewUser.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-lg font-semibold">{viewUser.name}</p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Mail className="size-3.5" />
                                        {viewUser.email}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                    Roles
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {viewUser.roles ? (
                                        viewUser.roles.split(', ').filter(Boolean).map((role) => (
                                            <Badge key={role} variant="secondary">
                                                <ShieldCheck className="mr-1 size-3" />
                                                {role}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                    Email Verified
                                </label>
                                <div className="flex items-center gap-1 text-sm">
                                    {viewUser.email_verified_at ? (
                                        <>
                                            <Verified className="size-4 text-green-600" />
                                            <span>{new Date(viewUser.email_verified_at).toLocaleString()}</span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">Not verified</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                    Created
                                </label>
                                <p className="flex items-center gap-1 text-sm">
                                    <Calendar className="size-3.5 text-muted-foreground" />
                                    {viewUser.created_at
                                        ? new Date(viewUser.created_at).toLocaleString()
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
