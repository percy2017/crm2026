import { Head } from '@inertiajs/react';
import { FileText, Plus, Trash2, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { index as quickRepliesIndex } from '@/routes/admin/quick-replies';

type QuickReply = {
    id: number;
    shortcut: string;
    message: string | null;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
};

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '';
}

export default function QuickRepliesIndex() {
    const [replies, setReplies] = useState<QuickReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [editReply, setEditReply] = useState<QuickReply | null>(null);
    const [editShortcut, setEditShortcut] = useState('');
    const [editMessage, setEditMessage] = useState('');
    const [editMediaUrl, setEditMediaUrl] = useState('');
    const [editMediaType, setEditMediaType] = useState('');
    const [saving, setSaving] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [createShortcut, setCreateShortcut] = useState('');
    const [createMessage, setCreateMessage] = useState('');
    const [createMediaUrl, setCreateMediaUrl] = useState('');
    const [createMediaType, setCreateMediaType] = useState('');
    const [creating, setCreating] = useState(false);

    const { confirm, dialogProps } = useConfirmDialog();

    const fetchReplies = useCallback(() => {
        setLoading(true);

        fetch(quickRepliesIndex().url + '/list', {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => res.json() as Promise<QuickReply[]>)
            .then(setReplies)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies, refreshKey]);

    const handleSave = async () => {
        if (!editReply || !editShortcut.trim()) return;

        setSaving(true);

        try {
            const res = await fetch(`/admin/quick-replies/${editReply.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    shortcut: editShortcut,
                    message: editMessage,
                    media_url: editMediaUrl || null,
                    media_type: editMediaType || null,
                }),
            });

            if (res.ok) {
                setEditReply(null);
                setRefreshKey((k) => k + 1);
            }
        } catch {
            /* ignore */
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async () => {
        if (!createShortcut.trim()) return;

        setCreating(true);

        try {
            const res = await fetch('/admin/quick-replies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    shortcut: createShortcut,
                    message: createMessage,
                    media_url: createMediaUrl || null,
                    media_type: createMediaType || null,
                }),
            });

            if (res.ok) {
                setShowCreate(false);
                setCreateShortcut('');
                setCreateMessage('');
                setCreateMediaUrl('');
                setCreateMediaType('');
                setRefreshKey((k) => k + 1);
            }
        } catch {
            /* ignore */
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = (reply: QuickReply) => {
        confirm(
            async () => {
                const res = await fetch(`/admin/quick-replies/${reply.id}`, {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                });

                if (res.ok) {
                    setRefreshKey((k) => k + 1);
                }
            },
            'Eliminar respuesta rápida',
            `¿Estás seguro de eliminar "/${reply.shortcut}"?`,
        );
    };

    const mediaLabel = (type: string | null) => {
        if (!type) return null;

        return <Badge variant="outline">{type}</Badge>;
    };

    const openEdit = (reply: QuickReply) => {
        setEditReply(reply);
        setEditShortcut(reply.shortcut);
        setEditMessage(reply.message ?? '');
        setEditMediaUrl(reply.media_url ?? '');
        setEditMediaType(reply.media_type ?? '');
    };

    return (
        <>
            <Head title="Respuestas Rápidas" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Respuestas Rápidas"
                        description="Escribe / en el chat para usar respuestas predefinidas"
                    />
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-1 size-4" />
                        Nueva
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Atajo</TableHead>
                                <TableHead>Mensaje</TableHead>
                                <TableHead>Archivo</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : replies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No hay respuestas rápidas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                replies.map((reply) => (
                                    <TableRow key={reply.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Zap className="size-4 text-amber-500" />
                                                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                                                    /{reply.shortcut}
                                                </code>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                            {reply.message ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {reply.media_url ? (
                                                <Badge variant="secondary" className="flex w-fit items-center gap-1">
                                                    <FileText className="size-3" />
                                                    {reply.media_type ?? 'file'}
                                                </Badge>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(reply)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(reply)}
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
            </div>

            <Dialog open={editReply !== null} onOpenChange={(o) => { if (!o) setEditReply(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar respuesta rápida</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Atajo</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/</span>
                                <Input
                                    value={editShortcut}
                                    onChange={(e) => setEditShortcut(e.target.value)}
                                    className="pl-6"
                                    placeholder="saludo"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Mensaje <span className="text-muted-foreground">({'{nombre}'}, {'{telefono}'})</span>
                            </label>
                            <Textarea
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                rows={4}
                                placeholder="Hola {nombre}, gracias por contactarnos..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">URL de archivo (opcional)</label>
                            <Input
                                value={editMediaUrl}
                                onChange={(e) => setEditMediaUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tipo de archivo</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={editMediaType}
                                onChange={(e) => setEditMediaType(e.target.value)}
                            >
                                <option value="">Ninguno</option>
                                <option value="image">Imagen</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="document">Documento</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditReply(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={!editShortcut.trim() || saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreate} onOpenChange={(o) => { if (!o) { setShowCreate(false); setCreateShortcut(''); setCreateMessage(''); setCreateMediaUrl(''); setCreateMediaType(''); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva respuesta rápida</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Atajo</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/</span>
                                <Input
                                    value={createShortcut}
                                    onChange={(e) => setCreateShortcut(e.target.value)}
                                    className="pl-6"
                                    placeholder="saludo"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Mensaje <span className="text-muted-foreground">({'{nombre}'}, {'{telefono}'})</span>
                            </label>
                            <Textarea
                                value={createMessage}
                                onChange={(e) => setCreateMessage(e.target.value)}
                                rows={4}
                                placeholder="Hola {nombre}, gracias por contactarnos..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">URL de archivo (opcional)</label>
                            <Input
                                value={createMediaUrl}
                                onChange={(e) => setCreateMediaUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Tipo de archivo</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={createMediaType}
                                onChange={(e) => setCreateMediaType(e.target.value)}
                            >
                                <option value="">Ninguno</option>
                                <option value="image">Imagen</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                                <option value="document">Documento</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowCreate(false); setCreateShortcut(''); setCreateMessage(''); setCreateMediaUrl(''); setCreateMediaType(''); }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate} disabled={!createShortcut.trim() || creating}>
                            {creating ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}