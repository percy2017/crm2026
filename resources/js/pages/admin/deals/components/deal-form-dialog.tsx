import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { DealData } from '@/pages/admin/deals/index';
import { index as adminDealsIndex } from '@/routes/admin/deals';

type Pipeline = { id: number; name: string; stages: { id: number; name: string }[] } | null;
type Contact = { id: number; name: string; phone: string };
type User = { id: number; name: string; email: string };

type Props = {
    open: boolean;
    deal: DealData | null;
    pipeline: Pipeline;
    contacts: Contact[];
    users: User[];
    onClose: () => void;
    onSaved: () => void;
};

export function DealFormDialog({ open, deal, pipeline, contacts, users, onClose, onSaved }: Props) {
    const isEdit = deal !== null;
    const defaultStageId = pipeline?.stages?.[0]?.id ?? 0;

    const [title, setTitle] = useState('');
    const [stageId, setStageId] = useState(defaultStageId);
    const [contactId, setContactId] = useState('');
    const [value, setValue] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [expectedCloseDate, setExpectedCloseDate] = useState('');
    const [probability, setProbability] = useState('');
    const [status, setStatus] = useState('open');
    const [lostReason, setLostReason] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            if (deal) {
                setTitle(deal.title);
                setStageId(deal.stage_id);
                setContactId(deal.contact_id ? String(deal.contact_id) : '');
                setValue(deal.value);
                setAssignedTo(deal.assigned_to ? String(deal.assigned_to) : '');
                setExpectedCloseDate(deal.expected_close_date ?? '');
                setProbability(deal.probability !== null ? String(deal.probability) : '');
                setStatus(deal.status);
                setLostReason(deal.lost_reason ?? '');
                setNotes(deal.notes ?? '');
            } else {
                setTitle('');
                setStageId(defaultStageId);
                setContactId('');
                setValue('');
                setAssignedTo('');
                setExpectedCloseDate('');
                setProbability('');
                setStatus('open');
                setLostReason('');
                setNotes('');
            }
        }
    }, [open, deal, defaultStageId]);

    const handleSubmit = async () => {
        setSaving(true);

        try {
            const body: Record<string, unknown> = {
                title,
                stage_id: stageId,
                pipeline_id: pipeline?.id,
                value: value ? Number(value) : 0,
                contact_id: contactId ? Number(contactId) : null,
                assigned_to: assignedTo ? Number(assignedTo) : null,
                expected_close_date: expectedCloseDate || null,
                probability: probability ? Number(probability) : null,
                status,
                lost_reason: lostReason || null,
                notes: notes || null,
            };

            const url = isEdit
                ? `${adminDealsIndex().url}/${deal!.id}`
                : adminDealsIndex().url;

            const res = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name=csrf-token]')?.content ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                onSaved();
            }
        } catch {
            /* ignore */
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => {
 if (!o) {
onClose();
} 
}}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Deal' : 'Create Deal'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the deal details.' : 'Create a new deal in the pipeline.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website redesign" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="stage">Stage</Label>
                            <Select value={String(stageId)} onValueChange={(v) => setStageId(Number(v))}>
                                <SelectTrigger id="stage">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {pipeline?.stages?.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="value">Value</Label>
                            <Input id="value" type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="contact">Contact</Label>
                            <Select value={contactId} onValueChange={setContactId}>
                                <SelectTrigger id="contact">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {contacts.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name} {c.phone ? `(${c.phone})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="assigned">Assigned to</Label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger id="assigned">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="expected_close_date">Expected close</Label>
                            <Input id="expected_close_date" type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
                        </div>

                        <div>
                            <Label htmlFor="probability">Probability (%)</Label>
                            <Input id="probability" type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="e.g. 50" />
                        </div>
                    </div>

                    {isEdit && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="won">Won</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {status === 'lost' && (
                                <div>
                                    <Label htmlFor="lost_reason">Lost reason</Label>
                                    <Input id="lost_reason" value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="Why was it lost?" />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional notes..." />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
                        {saving ? 'Saving...' : isEdit ? 'Save' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
