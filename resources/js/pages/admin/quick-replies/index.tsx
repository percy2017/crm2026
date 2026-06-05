import { Head } from '@inertiajs/react';
import { FileText, Paperclip, Plus, Trash2, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
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

type FormState = {
    shortcut: string;
    message: string;
    file: File | null;
    existingFile: string | null;
    mediaType: string;
};

const initialForm: FormState = {
    shortcut: '',
    message: '',
    file: null,
    existingFile: null,
    mediaType: '',
};

function FormFields({
    form,
    onChange,
    fileInputRef,
}: {
    form: FormState;
    onChange: (patch: Partial<FormState>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
    const existingPreviewUrl = form.existingFile && form.mediaType === 'image'
        ? '/storage/' + form.existingFile
        : null;

    const newPreviewUrl = form.file && form.mediaType === 'image'
        ? URL.createObjectURL(form.file)
        : null;

    return (
        <div className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">Atajo</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/</span>
                    <Input
                        value={form.shortcut}
                        onChange={(e) => onChange({ shortcut: e.target.value })}
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
                    value={form.message}
                    onChange={(e) => onChange({ message: e.target.value })}
                    rows={4}
                    placeholder="Hola {nombre}, gracias por contactarnos..."
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Archivo (opcional)</label>

                {newPreviewUrl && (
                    <img
                        src={newPreviewUrl}
                        alt="preview"
                        className="mb-2 max-h-32 w-full rounded-md border object-cover"
                    />
                )}

                {existingPreviewUrl && !form.file && (
                    <img
                        src={existingPreviewUrl}
                        alt="preview"
                        className="mb-2 max-h-32 w-full rounded-md border object-cover"
                    />
                )}

                {form.file ? (
                    <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                        <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{form.file.name}</span>
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => onChange({ file: null })}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                ) : form.existingFile ? (
                    <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-muted-foreground">
                            {form.existingFile.split('/').pop()}
                        </span>
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => onChange({ existingFile: null })}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="mr-2 size-4" />
                        Seleccionar archivo
                    </Button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => onChange({ file: e.target.files?.[0] ?? null })}
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium">Tipo de archivo</label>
                <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.mediaType}
                    onChange={(e) => onChange({ mediaType: e.target.value })}
                >
                    <option value="">Ninguno</option>
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documento</option>
                </select>
            </div>
        </div>
    );
}

export default function QuickRepliesIndex() {
    const [replies, setReplies] = useState<QuickReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [editReply, setEditReply] = useState<QuickReply | null>(null);
    const [editForm, setEditForm] = useState<FormState>(initialForm);
    const [saving, setSaving] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState<FormState>(initialForm);
    const [creating, setCreating] = useState(false);

    const editFileRef = useRef<HTMLInputElement>(null);
    const createFileRef = useRef<HTMLInputElement>(null);

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
            .catch(() => toast.error('Error al cargar respuestas rápidas'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies, refreshKey]);

    async function sendForm(
        url: string,
        method: string,
        form: FormState,
    ): Promise<boolean> {
        const body = new FormData();
        body.append('shortcut', form.shortcut);
        body.append('message', form.message);
        body.append('media_type', form.mediaType);

        if (form.file) {
            body.append('file', form.file);
        } else if (method === 'PUT' && !form.file && !form.existingFile) {
            body.append('remove_media', '1');
        }

        if (method === 'PUT') {
            body.append('_method', 'PUT');
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body,
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            toast.error(data.message ?? data.shortcut?.[0] ?? 'Error del servidor');

            return false;
        }

        return true;
    }

    const handleSave = async () => {
        if (!editReply || !editForm.shortcut.trim()) {
return;
}

        setSaving(true);

        try {
            const ok = await sendForm(
                `/admin/quick-replies/${editReply.id}`,
                'PUT',
                editForm,
            );

            if (ok) {
                toast.success('Respuesta rápida actualizada');
                setEditReply(null);
                setRefreshKey((k) => k + 1);
            }
        } catch {
            toast.error('Error de conexión al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async () => {
        if (!createForm.shortcut.trim()) {
return;
}

        setCreating(true);

        try {
            const ok = await sendForm('/admin/quick-replies', 'POST', createForm);

            if (ok) {
                toast.success('Respuesta rápida creada');
                setShowCreate(false);
                setCreateForm(initialForm);
                setRefreshKey((k) => k + 1);
            }
        } catch {
            toast.error('Error de conexión al crear');
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
                    toast.success('Respuesta rápida eliminada');
                    setRefreshKey((k) => k + 1);
                } else {
                    toast.error('Error al eliminar');
                }
            },
            'Eliminar respuesta rápida',
            `¿Estás seguro de eliminar "/${reply.shortcut}"?`,
        );
    };

    const mediaLabel = (type: string | null) => {
        if (!type) {
return null;
}

        return <Badge variant="outline">{type}</Badge>;
    };

    const openEdit = (reply: QuickReply) => {
        setEditReply(reply);
        setEditForm({
            shortcut: reply.shortcut,
            message: reply.message ?? '',
            file: null,
            existingFile: reply.media_url,
            mediaType: reply.media_type ?? '',
        });
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

            <Dialog open={editReply !== null} onOpenChange={(o) => {
 if (!o) {
 setEditReply(null); setEditForm(initialForm); 
} 
}}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar respuesta rápida</DialogTitle>
                    </DialogHeader>

                    <FormFields
                        form={editForm}
                        onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                        fileInputRef={editFileRef}
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
 setEditReply(null); setEditForm(initialForm); 
}}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={!editForm.shortcut.trim() || saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showCreate}
                onOpenChange={(o) => {
                    if (!o) {
                        setShowCreate(false);
                        setCreateForm(initialForm);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva respuesta rápida</DialogTitle>
                    </DialogHeader>

                    <FormFields
                        form={createForm}
                        onChange={(patch) => setCreateForm((prev) => ({ ...prev, ...patch }))}
                        fileInputRef={createFileRef}
                    />

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCreate(false);
                                setCreateForm(initialForm);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate} disabled={!createForm.shortcut.trim() || creating}>
                            {creating ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}