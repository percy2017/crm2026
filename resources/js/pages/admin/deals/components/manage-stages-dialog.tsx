import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

type Stage = {
    id: number;
    name: string;
    order: number;
    color: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
};

export function ManageStagesDialog({ open, onClose, onSaved }: Props) {
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingStage, setEditingStage] = useState<Stage | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formColor, setFormColor] = useState('#6b7280');

    const { confirm, dialogProps } = useConfirmDialog();

    const fetchStages = useCallback(() => {
        setLoading(true);
        fetch('/admin/pipeline-stages', {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
                if (json?.stages) {
setStages(json.stages);
}
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (open) {
fetchStages();
}
    }, [open, fetchStages]);

    const resetForm = () => {
        setShowForm(false);
        setEditingStage(null);
        setFormName('');
        setFormColor('#6b7280');
    };

    const openEdit = (stage: Stage) => {
        setEditingStage(stage);
        setFormName(stage.name);
        setFormColor(stage.color ?? '#6b7280');
        setShowForm(true);
    };

    const openCreate = () => {
        resetForm();
        setFormColor('#6b7280');
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
return;
}

        const url = editingStage
            ? `/admin/pipeline-stages/${editingStage.id}`
            : '/admin/pipeline-stages';
        const method = editingStage ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({ name: formName.trim(), color: formColor || null }),
        });

        if (res.ok) {
            resetForm();
            fetchStages();
            onSaved();
        }
    };

    const handleDelete = (stage: Stage) => {
        confirm(
            async () => {
                const res = await fetch(`/admin/pipeline-stages/${stage.id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                        Accept: 'application/json',
                    },
                });

                if (res.ok) {
                    fetchStages();
                    onSaved();
                }
            },
            'Delete Stage',
            `Are you sure you want to delete "${stage.name}"? Deals in this stage will be moved to the first stage.`,
        );
    };

    const moveUp = (index: number) => {
        if (index <= 0) {
return;
}

        const next = [...stages];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        next.forEach((s, i) => (s.order = i));
        setStages(next);
        persistOrder(next);
    };

    const moveDown = (index: number) => {
        if (index >= stages.length - 1) {
return;
}

        const next = [...stages];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        next.forEach((s, i) => (s.order = i));
        setStages(next);
        persistOrder(next);
    };

    const persistOrder = (ordered: Stage[]) => {
        fetch('/admin/pipeline-stages/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                stages: ordered.map((s, i) => ({ id: s.id, order: i })),
            }),
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(o) => {
 if (!o) {
 resetForm(); onClose(); 
} 
}}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Stages</DialogTitle>
                        <DialogDescription>
                            Add, edit, reorder, or remove pipeline stages.
                        </DialogDescription>
                    </DialogHeader>

                    {showForm ? (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="stage-name">Name</Label>
                                <Input
                                    id="stage-name"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Stage name"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stage-color">Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="stage-color"
                                        type="color"
                                        value={formColor}
                                        onChange={(e) => setFormColor(e.target.value)}
                                        className="size-10 w-16 cursor-pointer p-1"
                                    />
                                    <span className="text-sm text-muted-foreground">{formColor}</span>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 pt-2">
                                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                                <Button onClick={handleSave}>
                                    {editingStage ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-2 py-2">
                            {loading ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
                            ) : stages.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">No stages yet.</p>
                            ) : (
                                stages.map((stage, index) => (
                                    <div
                                        key={stage.id}
                                        className="flex items-center justify-between rounded-md border px-3 py-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                                            {stage.color && (
                                                <span
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: stage.color }}
                                                />
                                            )}
                                            <span className="text-sm font-medium">{stage.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => moveUp(index)} disabled={index === 0} title="Move up">
                                                ↑
                                            </Button>
                                            <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => moveDown(index)} disabled={index === stages.length - 1} title="Move down">
                                                ↓
                                            </Button>
                                            <Button variant="ghost" size="sm" className="size-7 p-0" onClick={() => openEdit(stage)} title="Edit">
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="size-7 p-0 text-destructive" onClick={() => handleDelete(stage)} title="Delete">
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {!showForm && (
                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>Close</Button>
                            <Button onClick={openCreate}>
                                <Plus className="mr-1 size-4" /> Add Stage
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
