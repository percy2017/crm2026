import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Widget = {
    id: number;
    name: string;
    domain: string;
    color: string | null;
    position: string;
    greeting: string | null;
    is_active: boolean;
    created_at: string;
};

export default function WebWidgetsIndex({ widgets }: { widgets: Widget[] }) {
    const [showDialog, setShowDialog] = useState(false);
    const [editing, setEditing] = useState<Widget | null>(null);
    const [form, setForm] = useState({ name: '', domain: '', color: '#3b82f6', position: 'right', greeting: '', is_active: true });

    const resetForm = () => {
        setForm({ name: '', domain: '', color: '#3b82f6', position: 'right', greeting: '', is_active: true });
        setEditing(null);
    };

    const openEdit = (w: Widget) => {
        setForm({ name: w.name, domain: w.domain, color: w.color ?? '#3b82f6', position: w.position, greeting: w.greeting ?? '', is_active: w.is_active });
        setEditing(w);
        setShowDialog(true);
    };

    const handleSave = () => {
        const url = editing ? `/admin/web-widgets/${editing.id}` : '/admin/web-widgets';
        const method = editing ? 'put' : 'post';

        router[method](url, form, {
            onSuccess: () => {
                setShowDialog(false);
                resetForm();
                toast.success(editing ? 'Widget updated' : 'Widget created');
            },
            onError: (err) => toast.error(Object.values(err).join(', ')),
        });
    };

    const handleDelete = (w: Widget) => {
        if (!confirm(`Delete widget "${w.name}"?`)) return;
        router.delete(`/admin/web-widgets/${w.id}`, {
            onSuccess: () => toast.success('Widget deleted'),
        });
    };

    const embedCode = (w: Widget) =>
        `<script src="${window.location.origin}/js/widget.js"></script>\n<script>\nwindow.CrmWidgetOptions = {\n  server: '${window.location.origin}',\n  color: '${w.color ?? '#3b82f6'}',\n  position: '${w.position}',\n  greeting: '${(w.greeting ?? '').replace(/'/g, "\\'")}'\n};\n</script>`;

    const copyEmbed = (w: Widget) => {
        navigator.clipboard.writeText(embedCode(w));
        toast.success('Embed code copied!');
    };

    return (
        <>
            <Head title="Web Widgets" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Web Widgets</h1>
                        <p className="text-sm text-muted-foreground">
                            Embeddable chat widgets for your websites.
                        </p>
                    </div>
                    <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                        Create Widget
                    </Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Embed</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {widgets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No widgets yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                widgets.map((w) => (
                                    <TableRow key={w.id}>
                                        <TableCell className="font-medium">{w.name}</TableCell>
                                        <TableCell>{w.domain}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-2">
                                                <span className="size-4 rounded-full" style={{ backgroundColor: w.color ?? '#3b82f6' }} />
                                                {w.color}
                                            </span>
                                        </TableCell>
                                        <TableCell>{w.is_active ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => copyEmbed(w)}>
                                                Copy Embed
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(w)}>Edit</Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(w)}>Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={showDialog} onOpenChange={(o) => { if (!o) { setShowDialog(false); resetForm(); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Widget' : 'Create Widget'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My Website" />
                        </div>
                        <div className="space-y-2">
                            <Label>Domain</Label>
                            <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="mydomain.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-2">
                                <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="size-10 w-16 cursor-pointer p-1" />
                                <span className="text-sm text-muted-foreground">{form.color}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="right">Right</option>
                                <option value="left">Left</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Greeting</Label>
                            <Input value={form.greeting} onChange={(e) => setForm({ ...form, greeting: e.target.value })} placeholder="Hola, ¿en qué podemos ayudarte?" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Active</Label>
                            <Checkbox checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: !!v })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>Cancel</Button>
                        <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
