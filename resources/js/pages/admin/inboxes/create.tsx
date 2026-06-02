import { Head, router } from '@inertiajs/react';
import { CheckCircle, Copy, Globe, Phone, User, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type EvolutionInstance = {
    name: string;
    connectionStatus: string;
    ownerJid: string | null;
    profileName: string | null;
    profilePicUrl: string | null;
    number: string | null;
    integration: string;
};

function formatJid(jid: string | null): string {
    if (!jid) {
return '—';
}

    const num = jid.split('@')[0];

    if (num.length >= 8) {
        return `+${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
    }

    return `+${num}`;
}

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function CreateInbox({ instances }: { instances: EvolutionInstance[] }) {
    const [type, setType] = useState('evolution');
    const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
    const [customName, setCustomName] = useState('');
    const [domain, setDomain] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [position, setPosition] = useState<'left' | 'right'>('right');
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState<{
        name: string;
        type: string;
        webhook_url: string | null;
        webhook_enabled: boolean;
        color?: string;
        position?: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
        if (status === 'open') {
return 'default';
}

        if (status === 'connecting') {
return 'secondary';
}

        if (status === 'close') {
return 'destructive';
}

        return 'outline';
    }

    async function handleCreate() {
        let name = '';

        if (type === 'evolution') {
            if (!selectedInstance) {
return;
}

            name = selectedInstance;
        } else {
            if (!customName.trim()) {
return;
}

            name = customName.trim();
        }

        setCreating(true);

        try {
            const res = await fetch('/admin/inboxes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ name, type, domain, color, position }),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message || 'Error creating inbox');

                return;
            }

            const data = await res.json();
            setCreated({
                    name: data.inbox.name,
                    type: data.inbox.type,
                    webhook_url: data.inbox.webhook_url,
                    webhook_enabled: data.inbox.webhook_enabled,
                    color: data.inbox.config?.color,
                    position: data.inbox.config?.position,
                });
        } catch {
            toast.error('Error creating inbox');
        } finally {
            setCreating(false);
        }
    }

    async function copyWebhook() {
        if (!created?.webhook_url) {
return;
}

        try {
            await navigator.clipboard.writeText(created.webhook_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    }

    if (created) {
        return (
            <>
                <Head title="Inbox Created" />

                <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 rounded-xl p-4">
                    <CheckCircle className="size-16 text-green-500" />
                    <Heading>Inbox "{created.name}" Created</Heading>

                    <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
                        {created.type === 'evolution' && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Webhook URL</span>
                                    <Badge variant={created.webhook_enabled ? 'default' : 'secondary'}>
                                        {created.webhook_enabled ? 'Enabled' : 'Not configured'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                                    <code className="flex-1 break-all text-sm">{created.webhook_url}</code>
                                    <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={copyWebhook}>
                                        <Copy className="size-4" />
                                    </Button>
                                </div>
                                {copied && <p className="text-xs text-green-600">Copied to clipboard!</p>}
                                <p className="text-xs text-muted-foreground">
                                    Evolution API will send incoming messages to this URL.
                                </p>
                            </>
                        )}
                        {created.type === 'web' && (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    Embed the widget on your site:
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={async () => {
                                        const html = `<script>
window.CrmWidgetOptions = {
  server: '${window.location.origin}',
  color: '${created.color}',
  position: '${created.position}',
};
</script>
<script src="${window.location.origin}/js/widget.js"></script>`;
                                        await navigator.clipboard.writeText(html.trim());
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}>
                                        <Copy className="mr-1 size-3" />
                                        {copied ? 'Copied!' : 'Copy HTML'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={async () => {
                                        const wp = `add_action('wp_footer', function() {
?>
<script>
window.CrmWidgetOptions = {
  server: '${window.location.origin}',
  color: '${created.color}',
  position: '${created.position}',
};
</script>
<script src="${window.location.origin}/js/widget.js"></script>
<?php
});`;
                                        await navigator.clipboard.writeText(wp.trim());
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}>
                                        <Copy className="mr-1 size-3" />
                                        {copied ? 'Copied!' : 'Copy WordPress'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.visit('/admin/inboxes')}>
                            Go to Inboxes
                        </Button>
                        <Button onClick={() => router.visit(`/admin/entradas/${encodeURIComponent(created.name)}`)}>
                            Open Chat
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Create Inbox" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading>Create Inbox</Heading>

                <div className="max-w-2xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className={`flex flex-1 items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                                    type === 'evolution'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-input hover:bg-accent'
                                }`}
                                onClick={() => {
 setType('evolution'); setSelectedInstance(null); 
}}
                            >
                                <Zap className="size-5" />
                                <div>
                                    <p className="font-medium">Evolution (WhatsApp)</p>
                                    <p className="text-xs text-muted-foreground">Connect a WhatsApp instance</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`flex flex-1 items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                                    type === 'web'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-input hover:bg-accent'
                                }`}
                                onClick={() => {
 setType('web'); setCustomName(''); 
}}
                            >
                                <Globe className="size-5" />
                                <div>
                                    <p className="font-medium">Web Widget</p>
                                    <p className="text-xs text-muted-foreground">Embeddable live chat</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {type === 'evolution' && (
                        <div className="mt-6 space-y-3">
                            <label className="text-sm font-medium">Select Instance</label>
                            {instances.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    No instances found in Evolution API.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {instances.map((inst) => {
                                        const isSelected = selectedInstance === inst.name;
                                        const statusVariant = getStatusVariant(inst.connectionStatus);

                                        return (
                                            <button
                                                key={inst.name}
                                                type="button"
                                                className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-input hover:bg-accent'
                                                }`}
                                                onClick={() => setSelectedInstance(inst.name)}
                                            >
                                                <Avatar className="size-12">
                                                    <AvatarImage src={inst.profilePicUrl ?? undefined} />
                                                    <AvatarFallback>
                                                        {inst.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{inst.name}</span>
                                                        <Badge variant={statusVariant} className="text-[10px]">
                                                            {inst.connectionStatus}
                                                        </Badge>
                                                    </div>
                                                    {inst.profileName && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <User className="size-3" />
                                                            {inst.profileName}
                                                        </div>
                                                    )}
                                                    {inst.ownerJid && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Phone className="size-3" />
                                                            {formatJid(inst.ownerJid)}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {type === 'web' && (
                        <div className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Inbox Name</label>
                                <Input
                                    placeholder="e.g. mi-sitio-web"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Website URL</label>
                                <Input
                                    placeholder="e.g. tusitio.com"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Domain where the widget will be embedded.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Widget Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="h-10 w-16 cursor-pointer rounded border border-input bg-transparent p-1"
                                    />
                                    <Input
                                        className="w-28"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="#3b82f6"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Button Position</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                                            position === 'left'
                                                ? 'border-primary bg-primary/5 font-medium'
                                                : 'border-input hover:bg-accent'
                                        }`}
                                        onClick={() => setPosition('left')}
                                    >
                                        Left
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                                            position === 'right'
                                                ? 'border-primary bg-primary/5 font-medium'
                                                : 'border-input hover:bg-accent'
                                        }`}
                                        onClick={() => setPosition('right')}
                                    >
                                        Right
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <Button
                            size="lg"
                            onClick={handleCreate}
                            disabled={
                                creating ||
                                (type === 'evolution' && !selectedInstance) ||
                                (type === 'web' && !customName.trim())
                            }
                        >
                            {creating ? 'Creating...' : 'Create Inbox'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}