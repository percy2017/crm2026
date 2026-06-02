import { Head, router } from '@inertiajs/react';
import { Copy, Globe, PaintBucket, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Inbox = {
    id: number;
    name: string;
    type: string;
    status: string;
    webhook_url: string | null;
    webhook_enabled: boolean;
    config: {
        instanceId?: string;
        apikey?: string;
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
};

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function EditInbox({ inbox }: { inbox: Inbox }) {
    const [domain, setDomain] = useState(inbox.config?.domain ?? '');
    const [color, setColor] = useState(inbox.config?.color ?? '#3b82f6');
    const [position, setPosition] = useState<'left' | 'right'>((inbox.config?.position as 'left' | 'right') ?? 'right');
    const [greeting, setGreeting] = useState(inbox.config?.greeting ?? '');
    const [status, setStatus] = useState(inbox.status);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    async function handleSave() {
        setSaving(true);

        const payload = inbox.type === 'web'
            ? { domain, color, position, greeting }
            : { status, webhook_enabled: inbox.webhook_enabled, webhook_url: inbox.webhook_url };

        try {
            const res = await fetch(`/admin/inboxes/${inbox.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message || 'Error saving');

                return;
            }

            toast.success('Inbox updated');
            router.visit('/admin/inboxes');
        } catch {
            toast.error('Error saving');
        } finally {
            setSaving(false);
        }
    }

    function copyEmbed(type: 'html' | 'wordpress') {
        const code = type === 'html'
            ? `<script>
window.CrmWidgetOptions = {
  server: '${window.location.origin}',
  color: '${color}',
  position: '${position}',
};
</script>
<script src="${window.location.origin}/js/widget.js"></script>`
            : `add_action('wp_footer', function() {
?>
<script>
window.CrmWidgetOptions = {
  server: '${window.location.origin}',
  color: '${color}',
  position: '${position}',
};
</script>
<script src="${window.location.origin}/js/widget.js"></script>
<?php
});`;

        navigator.clipboard.writeText(code.trim()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
    }

    return (
        <>
            <Head title={`Edit ${inbox.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title={`Edit Inbox: ${inbox.name}`}
                    description={inbox.type === 'web' ? 'Configure your web widget settings' : 'View and manage your WhatsApp inbox'}
                />

                <div className="max-w-2xl space-y-6">
                    {inbox.type === 'evolution' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="text-sm font-medium">WhatsApp Instance</h3>

                            {inbox.config?.profilePicUrl && (
                                <Avatar className="size-14">
                                    <AvatarImage src={inbox.config.profilePicUrl} />
                                    <AvatarFallback>{inbox.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Name</span>
                                    <p className="font-medium">{inbox.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Status</span>
                                    <p className="font-medium">
                                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
                                    </p>
                                </div>
                                {inbox.config?.profileName && (
                                    <div>
                                        <span className="text-muted-foreground flex items-center gap-1"><User className="size-3" /> Profile</span>
                                        <p className="font-medium">{inbox.config.profileName}</p>
                                    </div>
                                )}
                                {inbox.config?.ownerJid && (
                                    <div>
                                        <span className="text-muted-foreground flex items-center gap-1"><Phone className="size-3" /> JID</span>
                                        <p className="font-medium">{inbox.config.ownerJid}</p>
                                    </div>
                                )}
                                {inbox.config?.instanceId && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Instance ID</span>
                                        <p className="font-mono text-xs">{inbox.config.instanceId}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant={inbox.webhook_enabled ? 'default' : 'outline'}>
                                    Webhook {inbox.webhook_enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                                {inbox.webhook_url && (
                                    <code className="break-all">{inbox.webhook_url}</code>
                                )}
                            </div>
                        </div>
                    )}

                    {inbox.type === 'web' && (
                        <>
                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">Widget Config</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="domain">Website URL</Label>
                                    <Input
                                        id="domain"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder="tusitio.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="greeting">Greeting Message</Label>
                                    <Input
                                        id="greeting"
                                        value={greeting}
                                        onChange={(e) => setGreeting(e.target.value)}
                                        placeholder="Hola, ¿en qué podemos ayudarte?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Widget Color</Label>
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
                                        />
                                        <PaintBucket className="size-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Button Position</Label>
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

                            <div className="space-y-4 rounded-lg border p-4">
                                <h3 className="text-sm font-medium">Embed Code</h3>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => copyEmbed('html')}>
                                        <Copy className="mr-1 size-3" />
                                        {copied ? 'Copied!' : 'Copy HTML'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => copyEmbed('wordpress')}>
                                        <Copy className="mr-1 size-3" />
                                        {copied ? 'Copied!' : 'Copy WordPress'}
                                    </Button>
                                </div>

                                <div className="rounded-md bg-muted p-3">
                                    <code className="whitespace-pre text-xs">
{`<script>
window.CrmWidgetOptions = {
  server: '${window.location.origin}',
  color: '${color}',
  position: '${position}',
};
</script>
<script src="${window.location.origin}/js/widget.js"></script>`}
                                    </code>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => router.visit('/admin/inboxes')}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}