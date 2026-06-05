import { Head } from '@inertiajs/react';
import { Clock, Play, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

type CronJob = {
    id: number;
    name: string;
    command: string;
    arguments: Record<string, string> | null;
    frequency: string;
    is_active: boolean;
    timeout: number;
    max_runs: number | null;
    run_count: number;
    last_run_at: string | null;
    last_result: string | null;
    last_output: string | null;
    created_at: string;
};

type CronJobLog = {
    id: number;
    started_at: string;
    finished_at: string | null;
    result: string;
    output: string | null;
    duration_ms: number | null;
};

type CommandOption = {
    name: string;
    description: string;
};

const FREQUENCIES = [
    { value: 'everyMinute', label: 'Cada minuto' },
    { value: 'everyFiveMinutes', label: 'Cada 5 minutos' },
    { value: 'everyTenMinutes', label: 'Cada 10 minutos' },
    { value: 'everyFifteenMinutes', label: 'Cada 15 minutos' },
    { value: 'everyThirtyMinutes', label: 'Cada 30 minutos' },
    { value: 'hourly', label: 'Cada hora' },
    { value: 'everyTwoHours', label: 'Cada 2 horas' },
    { value: 'everySixHours', label: 'Cada 6 horas' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
];

const FREQ_LABELS: Record<string, string> = Object.fromEntries(
    FREQUENCIES.map((f) => [f.value, f.label]),
);

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '';
}

export default function CronJobsIndex() {
    const [jobs, setJobs] = useState<CronJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [commands, setCommands] = useState<CommandOption[]>([]);

    const [showDrawer, setShowDrawer] = useState(false);
    const [drawerJob, setDrawerJob] = useState<CronJob | null>(null);
    const [drawerLogs, setDrawerLogs] = useState<CronJobLog[]>([]);
    const [drawerLoading, setDrawerLoading] = useState(false);

    const [editJob, setEditJob] = useState<CronJob | null>(null);
    const [formName, setFormName] = useState('');
    const [formCommand, setFormCommand] = useState('');
    const [formArgs, setFormArgs] = useState('');
    const [formFreq, setFormFreq] = useState('everyMinute');
    const [formTimeout, setFormTimeout] = useState('0');
    const [formMaxRuns, setFormMaxRuns] = useState('');
    const [formActive, setFormActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    const { confirm, dialogProps } = useConfirmDialog();

    const fetchJobs = useCallback(async () => {
        setLoading(true);

        try {
            const res = await fetch('/admin/cron-jobs/list', {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            setJobs(await res.json());
        } catch {
            toast.error('Error al cargar tareas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchJobs();
    }, [fetchJobs, refreshKey]);

    useEffect(() => {
        fetch('/admin/cron-jobs/commands', {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => res.json() as Promise<CommandOption[]>)
            .then(setCommands)
            .catch(() => {});
    }, []);

    const openLogs = async (job: CronJob) => {
        setDrawerJob(job);
        setDrawerLoading(true);
        setShowDrawer(true);

        try {
            const res = await fetch(`/admin/cron-jobs/${job.id}/logs`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            setDrawerLogs(await res.json());
        } catch {
            toast.error('Error al cargar historial');
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editJob || !formName.trim() || !formCommand.trim()) {
return;
}

        setSaving(true);

        try {
            const res = await fetch(`/admin/cron-jobs/${editJob.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    name: formName,
                    command: formCommand,
                    arguments: formArgs || null,
                    frequency: formFreq,
                    timeout: parseInt(formTimeout) || 0,
                    max_runs: formMaxRuns ? parseInt(formMaxRuns) : null,
                    is_active: formActive,
                }),
            });

            if (res.ok) {
                toast.success('Tarea actualizada');
                setEditJob(null);
                setRefreshKey((k) => k + 1);
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message ?? 'Error al guardar');
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async () => {
        if (!formName.trim() || !formCommand.trim()) {
return;
}

        setCreating(true);

        try {
            const res = await fetch('/admin/cron-jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    name: formName,
                    command: formCommand,
                    arguments: formArgs || null,
                    frequency: formFreq,
                    timeout: parseInt(formTimeout) || 0,
                    max_runs: formMaxRuns ? parseInt(formMaxRuns) : null,
                    is_active: formActive,
                }),
            });

            if (res.ok) {
                toast.success('Tarea creada');
                setShowCreate(false);
                resetForm();
                setRefreshKey((k) => k + 1);
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message ?? 'Error al crear');
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (job: CronJob) => {
        try {
            const res = await fetch(`/admin/cron-jobs/${job.id}/toggle`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (res.ok) {
                setRefreshKey((k) => k + 1);
            }
        } catch {
            toast.error('Error al cambiar estado');
        }
    };

    const handleRunNow = async (job: CronJob) => {
        try {
            const res = await fetch(`/admin/cron-jobs/${job.id}/run`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`Ejecutado: ${data.result} (${data.duration_ms}ms)`);
                setRefreshKey((k) => k + 1);
            } else {
                toast.error('Error al ejecutar');
            }
        } catch {
            toast.error('Error de conexión');
        }
    };

    const handleDelete = (job: CronJob) => {
        confirm(
            async () => {
                const res = await fetch(`/admin/cron-jobs/${job.id}`, {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                });

                if (res.ok) {
                    toast.success('Tarea eliminada');
                    setRefreshKey((k) => k + 1);
                } else {
                    toast.error('Error al eliminar');
                }
            },
            'Eliminar tarea',
            `¿Estás seguro de eliminar "${job.name}"?`,
        );
    };

    const openEdit = (job: CronJob) => {
        setEditJob(job);
        setFormName(job.name);
        setFormCommand(job.command);
        setFormArgs(job.arguments ? JSON.stringify(job.arguments, null, 2) : '');
        setFormFreq(job.frequency);
        setFormTimeout(String(job.timeout));
        setFormMaxRuns(job.max_runs !== null ? String(job.max_runs) : '');
        setFormActive(job.is_active);
    };

    const resetForm = () => {
        setFormName('');
        setFormCommand('');
        setFormArgs('');
        setFormFreq('everyMinute');
        setFormTimeout('0');
        setFormMaxRuns('');
        setFormActive(true);
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    return (
        <>
            <Head title="Cron Jobs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Cron Jobs"
                        description="Gestiona tareas programadas del sistema"
                    />
                    <Button onClick={openCreate}>
                        <Plus className="mr-1 size-4" />
                        Nueva tarea
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Comando</TableHead>
                                <TableHead>Frecuencia</TableHead>
                                <TableHead>Ejecuciones</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Última ejecución</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : jobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No hay tareas programadas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.name}</TableCell>
                                        <TableCell>
                                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                {job.command}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {FREQ_LABELS[job.frequency] ?? job.frequency}
                                        </TableCell>
                                        <TableCell className="text-sm">{job.run_count}</TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => handleToggle(job)}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    job.is_active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${
                                                        job.is_active
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-400'
                                                    }`}
                                                />
                                                {job.is_active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {job.last_run_at ? (
                                                <span className="flex items-center gap-1">
                                                    {job.last_result === 'success' ? (
                                                        <span className="size-1.5 rounded-full bg-green-500" />
                                                    ) : (
                                                        <span className="size-1.5 rounded-full bg-red-500" />
                                                    )}
                                                    {job.last_run_at}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRunNow(job)}
                                                    title="Ejecutar ahora"
                                                >
                                                    <Play className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openLogs(job)}
                                                    title="Ver historial"
                                                >
                                                    <Clock className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(job)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(job)}
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

            {/* Historial drawer */}
            <Dialog open={showDrawer} onOpenChange={(o) => {
 if (!o) {
setShowDrawer(false);
} 
}}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Historial: {drawerJob?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {drawerLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Cargando...</div>
                    ) : drawerLogs.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Sin ejecuciones registradas.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {drawerLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="rounded-lg border p-3 text-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {log.result === 'success' ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                                                    Success
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800">
                                                    Failed
                                                </Badge>
                                            )}
                                            <span className="text-muted-foreground">
                                                {log.started_at}
                                            </span>
                                        </div>
                                        {log.duration_ms !== null && (
                                            <span className="text-muted-foreground">
                                                {log.duration_ms}ms
                                            </span>
                                        )}
                                    </div>
                                    {log.output && (
                                        <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-xs text-muted-foreground">
                                            {log.output}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={editJob !== null} onOpenChange={(o) => {
 if (!o) {
 setEditJob(null); 
} 
}}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar tarea</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Nombre</label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Health Check"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Comando</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formCommand}
                                onChange={(e) => setFormCommand(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {commands.map((cmd) => (
                                    <option key={cmd.name} value={cmd.name}>
                                        {cmd.name} — {cmd.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Argumentos (JSON opcional)
                            </label>
                            <Textarea
                                value={formArgs}
                                onChange={(e) => setFormArgs(e.target.value)}
                                rows={3}
                                placeholder='{"name": "tigo1"}'
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Frecuencia</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formFreq}
                                onChange={(e) => setFormFreq(e.target.value)}
                            >
                                {FREQUENCIES.map((f) => (
                                    <option key={f.value} value={f.value}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Timeout (segundos)
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={formTimeout}
                                    onChange={(e) => setFormTimeout(e.target.value)}
                                    placeholder="0 = sin límite"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Máx. ejecuciones
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={formMaxRuns}
                                    onChange={(e) => setFormMaxRuns(e.target.value)}
                                    placeholder="Vacío = ilimitado"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-active"
                                checked={formActive}
                                onChange={(e) => setFormActive(e.target.checked)}
                                className="size-4 rounded border-gray-300"
                            />
                            <label htmlFor="edit-active" className="text-sm">
                                Activa
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditJob(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={!formName.trim() || !formCommand.trim() || saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create dialog */}
            <Dialog
                open={showCreate}
                onOpenChange={(o) => {
 if (!o) {
setShowCreate(false);
} 
}}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva tarea programada</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Nombre</label>
                            <Input
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder="Health Check"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Comando</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formCommand}
                                onChange={(e) => setFormCommand(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {commands.map((cmd) => (
                                    <option key={cmd.name} value={cmd.name}>
                                        {cmd.name} — {cmd.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Argumentos (JSON opcional)
                            </label>
                            <Textarea
                                value={formArgs}
                                onChange={(e) => setFormArgs(e.target.value)}
                                rows={3}
                                placeholder='{"name": "tigo1"}'
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Frecuencia</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formFreq}
                                onChange={(e) => setFormFreq(e.target.value)}
                            >
                                {FREQUENCIES.map((f) => (
                                    <option key={f.value} value={f.value}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Timeout (segundos)
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={formTimeout}
                                    onChange={(e) => setFormTimeout(e.target.value)}
                                    placeholder="0 = sin límite"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Máx. ejecuciones
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={formMaxRuns}
                                    onChange={(e) => setFormMaxRuns(e.target.value)}
                                    placeholder="Vacío = ilimitado"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="create-active"
                                checked={formActive}
                                onChange={(e) => setFormActive(e.target.checked)}
                                className="size-4 rounded border-gray-300"
                            />
                            <label htmlFor="create-active" className="text-sm">
                                Activa
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate} disabled={!formName.trim() || !formCommand.trim() || creating}>
                            {creating ? 'Creando...' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}