import { Globe, Music2, Video, type LucideIcon } from 'lucide-react';

const URL_REGEX = /https?:\/\/[^\s<]+/g;

export function extractUrls(text: string): string[] {
    return text.match(URL_REGEX) ?? [];
}

type LinkPreviewData = {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
};

function getHost(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

const PLATFORM_ICONS: Record<string, LucideIcon> = {
    'facebook.com': Globe,
    'instagram.com': Globe,
    'tiktok.com': Music2,
    'vm.tiktok.com': Music2,
    'youtube.com': Video,
    'youtu.be': Video,
    'chat.whatsapp.com': Globe,
};

const PLATFORM_LABELS: Record<string, string> = {
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'facebook.com': 'Facebook',
    'instagram.com': 'Instagram',
    'tiktok.com': 'TikTok',
    'vm.tiktok.com': 'TikTok',
    'chat.whatsapp.com': 'WhatsApp',
};

function getPlatformInfo(url: string): { Icon: LucideIcon; label: string } {
    const host = getHost(url);
    const Icon = PLATFORM_ICONS[host] ?? Globe;
    const label = PLATFORM_LABELS[host] ?? host;

    return { Icon, label };
}

function PreviewCard({ data }: { data: LinkPreviewData }) {
    const { Icon, label } = getPlatformInfo(data.url);

    return (
        <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block overflow-hidden rounded-lg border bg-background/50 transition-colors hover:bg-muted/50"
        >
            {data.image && (
                <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
                    <img
                        src={data.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="flex flex-col gap-0.5 p-3">
                {data.title && (
                    <span className="line-clamp-2 text-sm font-medium text-foreground">
                        {data.title}
                    </span>
                )}
                {data.description && (
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                        {data.description}
                    </span>
                )}
                <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Icon className="size-3" />
                    {label}
                </span>
            </div>
        </a>
    );
}

export function LinkPreview({ savedPreview }: { savedPreview: LinkPreviewData | null }) {
    if (savedPreview?.image || savedPreview?.title) {
        return <PreviewCard data={savedPreview} />;
    }

    if (savedPreview && getHost(savedPreview.url) === 'chat.whatsapp.com') {
        return <PreviewCard data={{ ...savedPreview, title: 'Invitación a grupo de WhatsApp' }} />;
    }

    return null;
}
