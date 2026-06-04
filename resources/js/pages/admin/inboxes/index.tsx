import { Head, router } from '@inertiajs/react';
import { Archive, Copy, Edit, Code, Globe, Inbox, Phone, Plus, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type InboxData = {
    id: number;
    name: string;
    type: string;
    status: string;
    webhook_url: string | null;
    webhook_enabled: boolean;
    config: {
        instanceId?: string;
        ownerJid?: string;
        profileName?: string;
        profilePicUrl?: string;
        connectionStatus?: string;
        number?: string;
        domain?: string;
        color?: string;
        position?: string;
        greeting?: string;
    } | null;
    created_at: string;
};

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function InboxesIndex({ inboxes: initial }: { inboxes: InboxData[] }) {
const [inboxes, setInboxes] = useState<InboxData[]>(initial);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    function getCsrfToken(): string {
        return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    }

    async function copyEmbed(inbox: InboxData) {
        const color = inbox.config?.color ?? '#3b82f6';
        const position = inbox.config?.position ?? 'right';
        const code = `<script>
window.CrmWidgetOptions = {
  server: '${window.location.origin}',
  color: '${color}',
  position: '${position}',
};
</script>
<script src="${window.location.origin}/js/widget.js"></script>`;

        try {
            await navigator.clipboard.writeText(code.trim());
            setCopiedId(inbox.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // ignore
        }
    }

    async function handleDelete(id: number) {
        try {
            const res = await fetch(`/admin/inboxes/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!res.ok) {
return;
}

            setInboxes((prev) => prev.filter((i) => i.id !== id));
            setDeleteId(null);
            toast.success('Inbox deleted');
        } catch {
            toast.error('Error deleting inbox');
        }
    }

    return (
        <>
            <Head title="Inboxes" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading>Inboxes</Heading>
                    <Button asChild>
                        <a href="/admin/inboxes/create">
                            <Plus className="mr-2 size-4" />
                            Create Inbox
                        </a>
                    </Button>
                </div>

                {inboxes.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
                        <Inbox className="size-12" />
                        <p className="text-lg font-medium">No inboxes yet</p>
                        <p className="text-sm">Create your first inbox to start receiving messages.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {inboxes.map((inbox) => (
                            <Card key={inbox.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                                    <div className="flex items-center gap-3">
                                        {inbox.type === 'evolution' && inbox.config?.profilePicUrl ? (
                                            <Avatar className="size-10">
                                                <AvatarImage src={inbox.config.profilePicUrl} />
                                                <AvatarFallback>
                                                    {inbox.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : null}
                                        <div>
                                            <span className="font-semibold">{inbox.name}</span>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {inbox.type}
                                                </Badge>
                                                <Badge
                                                    variant={inbox.status === 'active' ? 'default' : 'secondary'}
                                                    className="text-[10px]"
                                                >
                                                    {inbox.status}
                                                </Badge>
                                                {inbox.type === 'evolution' && inbox.config?.connectionStatus && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] ${
                                                            inbox.config.connectionStatus === 'open' ? 'border-green-300 text-green-700' :
                                                            inbox.config.connectionStatus === 'connecting' || inbox.config.connectionStatus === 'syncing' ? 'border-yellow-300 text-yellow-700' :
                                                            'border-red-300 text-red-700'
                                                        }`}
                                                    >
                                                        <span className={`mr-0.5 size-1.5 shrink-0 rounded-full ${
                                                            inbox.config.connectionStatus === 'open' ? 'bg-green-500' :
                                                            inbox.config.connectionStatus === 'connecting' || inbox.config.connectionStatus === 'syncing' ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`} />
                                                        {inbox.config.connectionStatus}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0"
                                            asChild
                                        >
                                            <a href={`/admin/inboxes/${inbox.id}/edit`}>
                                                <Edit className="size-3.5" />
                                            </a>
                                        </Button>
                                        {inbox.webhook_enabled ? (
                                            <Badge variant="default" className="text-[10px]">Webhook ✅</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px]">No webhook</Badge>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0"
                                            onClick={() => {
                                                fetch(`/admin/inboxes/backup/${inbox.id}`, {
                                                    method: 'POST',
                                                    headers: {
                                                        Accept: 'application/json',
                                                        'X-Requested-With': 'XMLHttpRequest',
                                                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                                                    },
                                                })
                                                    .then((res) => res.json())
                                                    .then((data) => {
                                                        if (data.error) {
 toast.error(data.error);

 return; 
}

                                                        if (data.url) {
 window.location.href = data.url; 
}

                                                        toast.success('Backup listo');
                                                    })
                                                    .catch(() => toast.error('Error al generar backup'));
                                            }}
                                        >
                                            <Archive className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0 text-destructive"
                                            onClick={() => setDeleteId(inbox.id)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-1.5 text-sm">
                                    {inbox.type === 'evolution' && inbox.config && (
                                        <>
                                            {inbox.config.instanceId && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(inbox.config.instanceId!);
                                                        setCopiedId(inbox.id);
                                                        setTimeout(() => setCopiedId(null), 2000);
                                                    }}
                                                    className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Code className="size-3 shrink-0" />
                                                    <span className="truncate font-mono">{inbox.config.instanceId}</span>
                                                    {copiedId === inbox.id && (
                                                        <span className="shrink-0 text-green-500 text-[10px]">Copied!</span>
                                                    )}
                                                </button>
                                            )}
                                            {inbox.config.profileName && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <User className="size-3" />
                                                    {inbox.config.profileName}
                                                </div>
                                            )}
                                            {inbox.config.ownerJid && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Phone className="size-3" />
                                                    {inbox.config.ownerJid}
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {inbox.type === 'web' && inbox.config && (
                                        <div className="text-xs text-muted-foreground">
                                            <div>Domain: {inbox.config.domain}</div>
                                            <div>Greeting: {inbox.config.greeting}</div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 h-7 text-xs"
                                                onClick={() => copyEmbed(inbox)}
                                            >
                                                {copiedId === inbox.id ? (
                                                    <>Copied!</>
                                                ) : (
                                                    <><Copy className="mr-1 size-3" /> Copy Embed</>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    <div className="pt-1 text-[10px] text-muted-foreground">
                                        Created {new Date(inbox.created_at).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete inbox</DialogTitle>
                        <DialogDescription>
                            Are you sure? This will not remove the webhook from Evolution API.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}