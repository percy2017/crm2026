import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, CalendarDays, HardDrive, FileType, Download, Trash2, X, Link as LinkIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { index as adminMediaIndex } from '@/routes/admin/media';

type MediaFile = {
    name: string;
    size: number;
    mime: string;
    last_modified: number;
    url: string;
};

type ListResponse = {
    data: MediaFile[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
};

const FILE_ICONS: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📽',
    pptx: '📽',
    zip: '📦',
    rar: '📦',
    gz: '📦',
    mp3: '🎵',
    wav: '🎵',
    ogg: '🎵',
    aac: '🎵',
    flac: '🎵',
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
    mkv: '🎬',
    webm: '🎬',
    jpg: '🖼',
    jpeg: '🖼',
    png: '🖼',
    gif: '🖼',
    webp: '🖼',
    svg: '🖼',
};

function getExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    return ext;
}

function getFileIcon(filename: string, mime: string): string {
    if (mime.startsWith('image/')) return '🖼';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.startsWith('text/')) return '📄';

    const ext = getExtension(filename);
    return FILE_ICONS[ext] ?? '📁';
}

function isImage(mime: string): boolean {
    return mime.startsWith('image/');
}

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('es', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function MediaIndex() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState<MediaFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const { confirm, dialogProps } = useConfirmDialog();

    const loadFiles = async (pageNum: number, append: boolean) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await fetch(`${adminMediaIndex().url}/list?page=${pageNum}&per_page=20`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json: ListResponse = await res.json();

            if (append) {
                setFiles((prev) => [...prev, ...json.data]);
            } else {
                setFiles(json.data);
            }

            setHasMore(json.has_more);
            setPage(pageNum);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadFiles(1, false);
    }, []);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadFiles(page + 1, true);
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, page]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await fetch(adminMediaIndex().url + '/upload', {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: formData,
            });
            setSelected(null);
            loadFiles(1, false);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = (filename: string) => {
        confirm(
            () => {
                router.delete(`/admin/media/${encodeURIComponent(filename)}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelected(null);
                        loadFiles(1, false);
                    },
                });
            },
            'Delete File',
            `Are you sure you want to delete "${filename}"?`,
        );
    };

    const [copied, setCopied] = useState(false);

    const handleCopyUrl = useCallback(async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for older browsers
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, []);

    return (
        <>
            <Head title="Medios" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Medios" description="Click any file to view details" />
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {files.map((file) => (
                        <button
                            key={file.name}
                            type="button"
                            onClick={() => setSelected(file)}
                            className="flex flex-col overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-left transition-shadow hover:shadow-md"
                        >
                            <div className="flex aspect-square items-center justify-center bg-muted p-4">
                                {isImage(file.mime) ? (
                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        className="size-full object-contain"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="text-5xl">
                                        {getFileIcon(file.name, file.mime)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 p-3">
                                <p className="truncate text-sm font-medium" title={file.name}>
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatSize(file.size)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(file.last_modified)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="py-8 text-center text-muted-foreground">Loading...</div>
                )}

                {loadingMore && (
                    <div className="py-4 text-center text-muted-foreground">Loading more...</div>
                )}

                {!loading && files.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                        No files yet. Upload your first file.
                    </div>
                )}

                <div ref={sentinelRef} className="h-4" />
            </div>

            <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
                <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto p-0">
                    {selected && (
                        <>
                            <div className="sticky top-0 z-10 border-b bg-card px-6 py-4">
                                <SheetHeader className="text-left">
                                    <div className="flex items-center justify-between">
                                        <SheetTitle className="text-lg truncate pr-4">
                                            {selected.name}
                                        </SheetTitle>
                                        <button
                                            type="button"
                                            onClick={() => setSelected(null)}
                                            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                    <SheetDescription>
                                        {formatSize(selected.size)} — {selected.mime}
                                    </SheetDescription>
                                </SheetHeader>
                            </div>

                            <div className="px-6 py-4 space-y-6">
                                <div className="flex aspect-video items-center justify-center rounded-xl bg-muted overflow-hidden">
                                    {isImage(selected.mime) ? (
                                        <img
                                            src={selected.url}
                                            alt={selected.name}
                                            className="size-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-7xl">
                                            {getFileIcon(selected.name, selected.mime)}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <FileType className="size-3.5 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Tipo</p>
                                        </div>
                                        <p className="text-sm font-medium truncate">{selected.mime}</p>
                                    </div>
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <HardDrive className="size-3.5 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Tamaño</p>
                                        </div>
                                        <p className="text-sm font-medium">{formatSize(selected.size)}</p>
                                    </div>
                                    <div className="col-span-2 rounded-lg bg-muted/50 p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CalendarDays className="size-3.5 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">Modificado</p>
                                        </div>
                                        <p className="text-sm font-medium">{formatDate(selected.last_modified)}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <LinkIcon className="size-4 text-muted-foreground" />
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                                        <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                                            {selected.url}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyUrl(selected.url)}
                                            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                                            title="Copy URL"
                                        >
                                            {copied ? (
                                                <Check className="size-4 text-green-500" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="default" className="flex-1" asChild>
                                        <a href={selected.url} download target="_blank">
                                            <Download className="size-4 mr-1" /> Descargar
                                        </a>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(selected.name)}
                                        title="Eliminar"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
