import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { DealData } from '@/pages/admin/deals/index';

function getInitials(name?: string | null): string {
    if (!name) {
return '?';
}

    return name.charAt(0).toUpperCase();
}

export function DealCard({ deal }: { deal: DealData }) {
    const isClosed = deal.status === 'won' || deal.status === 'lost';
    const value = Number(deal.value);

    return (
        <div
            className={`rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
                isClosed ? 'opacity-70' : ''
            }`}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-sm font-medium leading-tight">{deal.title}</span>
                {value > 0 && (
                    <span className="shrink-0 text-sm font-semibold">
                        ${value.toFixed(2)}
                    </span>
                )}
            </div>

            {deal.contact && (
                <div className="mb-2 flex items-center gap-1.5">
                    <Avatar className="size-5">
                        <AvatarFallback className="text-[10px]">
                            {getInitials(deal.contact.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs text-muted-foreground">
                        {deal.contact.name}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between">
                {deal.expected_close_date && (
                    <span className="text-[11px] text-muted-foreground">
                        Due: {new Date(deal.expected_close_date).toLocaleDateString()}
                    </span>
                )}
                {deal.probability !== null && !isClosed && (
                    <span
                        className={`text-[11px] font-medium ${
                            deal.probability >= 70
                                ? 'text-green-600'
                                : deal.probability >= 40
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                        }`}
                    >
                        {deal.probability}%
                    </span>
                )}
                {isClosed && (
                    <span
                        className={`text-[11px] font-medium ${
                            deal.status === 'won' ? 'text-green-600' : 'text-destructive'
                        }`}
                    >
                        {deal.status === 'won' ? 'Won' : 'Lost'}
                    </span>
                )}
            </div>
        </div>
    );
}
