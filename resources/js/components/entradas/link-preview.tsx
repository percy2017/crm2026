import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

type LinkPreviewData = {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
};

const URL_REGEX = /https?:\/\/[^\s<]+/g;

function extractUrls(text: string): string[] {
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
            .then((res) => res.json())
            .then((json) => {
                if (json.title || json.image) {
                    setData(json);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [url]);

    return { data, loading };
}

export function LinkPreview({ text }: { text: string }) {
    const urls = extractUrls(text);
    const firstUrl = urls[0] ?? null;
    const { data, loading } = useLinkPreview(firstUrl);

    if (!data) {
        return null;
    }

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
                    <ExternalLink className="size-3" />
                    {new URL(data.url).hostname}
                </span>
            </div>
        </a>
    );
}