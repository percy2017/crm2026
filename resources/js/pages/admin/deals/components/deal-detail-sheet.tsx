import { Calendar, DollarSign, User, Target, FileText, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { index as adminDealsIndex } from '@/routes/admin/deals';

type DealDetail = {
    id: number;
    title: string;
    value: string;
    status: string;
    lost_reason: string | null;
    expected_close_date: string | null;
    probability: number | null;
    notes: string | null;
    closed_at: string | null;
    created_at: string;
    contact: { id: number; name: string; phone: string; profile_pic_url: string | null } | null;
    assigned_user: { id: number; name: string; email: string } | null;
    pipeline: { id: number; name: string } | null;
    stage: { id: number; name: string; color: string | null } | null;
};

type Props = {
    dealId: number | null;
    onClose: () => void;
    onEdit: (deal: { id: number; title: string; stage_id: number; contact_id: number | null; value: string; assigned_to: number | null; expected_close_date: string | null; probability: number | null; status: string; lost_reason: string | null; notes: string | null }) => void;
    onDeleted: (deal: { id: number }) => void;
};

export function DealDetailSheet({ dealId, onClose, onEdit, onDeleted }: Props) {
    const [deal, setDeal] = useState<DealDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const { confirm, dialogProps } = useConfirmDialog();

    useEffect(() => {
        if (dealId === null) {
            setDeal(null);

            return;
        }

        setLoading(true);
        fetch(`${adminDealsIndex().url}/${dealId}`, {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => setDeal(json?.data ?? null))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [dealId]);

    const handleDelete = useCallback(() => {
        if (!deal) {
return;
}

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
                    onDeleted(deal);
                }
            },
            'Delete Deal',
            `Are you sure you want to delete "${deal.title}"?`,
        );
    }, [deal, confirm, onDeleted]);

    const value = Number(deal?.value ?? 0);

    return (
        <>
            <Sheet open={dealId !== null} onOpenChange={(o) => {
 if (!o) {
onClose();
} 
}}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{deal?.title ?? 'Deal Details'}</SheetTitle>
                        <SheetDescription>
                            {deal?.pipeline?.name ?? ''}
                        </SheetDescription>
                    </SheetHeader>

                    {loading ? (
                        <div className="mt-10 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : !deal ? null : (
                        <div className="mt-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                    <TrendingUp className="size-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">{deal.title}</p>
                                    {deal.stage && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            {deal.stage.color && (
                                                <span className="size-2 rounded-full" style={{ backgroundColor: deal.stage.color }} />
                                            )}
                                            {deal.stage.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        deal.status === 'won'
                                            ? 'success'
                                            : deal.status === 'lost'
                                                ? 'destructive'
                                                : 'secondary'
                                    }
                                    className="text-xs"
                                >
                                    {deal.status}
                                </Badge>
                                {value > 0 && (
                                    <span className="text-lg font-bold">
                                        ${value.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {deal.contact && (
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <Avatar className="size-10">
                                        <AvatarFallback>{deal.contact.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{deal.contact.name}</p>
                                        {deal.contact.phone && (
                                            <p className="text-xs text-muted-foreground">{deal.contact.phone}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {deal.assigned_user && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="size-4 text-muted-foreground" />
                                    <span>Assigned to <strong>{deal.assigned_user.name}</strong></span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {deal.expected_close_date && (
                                    <div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="size-3" /> Expected close
                                        </p>
                                        <p className="text-sm">{new Date(deal.expected_close_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                                {deal.probability !== null && (
                                    <div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Target className="size-3" /> Probability
                                        </p>
                                        <p className="text-sm">{deal.probability}%</p>
                                    </div>
                                )}
                                {deal.closed_at && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Closed at</p>
                                        <p className="text-sm">{new Date(deal.closed_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {deal.lost_reason && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Lost reason</p>
                                    <p className="text-sm text-destructive">{deal.lost_reason}</p>
                                </div>
                            )}

                            {deal.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                        <FileText className="size-3" /> Notes
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm">{deal.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <SheetFooter className="mt-6 flex-row gap-2">
                        {deal && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(deal)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
