import { ExternalLink, Globe, Music2, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

type LinkPreviewData = {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
};

const URL_REGEX = /https?:\/\/[^\s<]+/g;

export function extractUrls(text: string): string[] {
    return text.match(URL_REGEX) ?? [];
}

function useLinkPreview(url: string | null) {
    const [data, setData] = useState<LinkPreviewData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url) {
            return;
        }

        setLoading(true);
        setData(null);

        fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((res) => res.json() as Promise<LinkPreviewData>)
            .then(setData)
            .catch(() => setData({ url, title: null, description: null, image: null }))
            .finally(() => setLoading(false));
    }, [url]);

    return { data, loading };
}

function hostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

const PLATFORM_ICONS: Record<string, typeof Globe> = {
    'facebook.com': Globe,
    'instagram.com': Globe,
    'tiktok.com': Music2,
    'vm.tiktok.com': Music2,
    'youtube.com': Video,
    'youtu.be': Video,
};

const PLATFORM_LABELS: Record<string, string> = {
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'facebook.com': 'Facebook',
    'instagram.com': 'Instagram',
    'tiktok.com': 'TikTok',
    'vm.tiktok.com': 'TikTok',
};

function getPlatformInfo(url: string): { Icon: typeof Globe; label: string } {
    const host = hostname(url);
    const Icon = PLATFORM_ICONS[host] ?? Globe;

    return { Icon, label: PLATFORM_LABELS[host] ?? host };
}

export function LinkPreview({ text }: { text: string }) {
    const urls = extractUrls(text);
    const firstUrl = urls[0] ?? null;
    const { data, loading } = useLinkPreview(firstUrl);

    if (!data && !loading) {
        return null;
    }

    if (loading || !data) {
        return (
            <div className="mt-1 animate-pulse overflow-hidden rounded-lg border bg-muted/30">
                <div className="aspect-[2/1] w-full bg-muted" />
                <div className="flex flex-col gap-2 p-3">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-2 w-1/2 rounded bg-muted" />
                </div>
            </div>
        );
    }

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