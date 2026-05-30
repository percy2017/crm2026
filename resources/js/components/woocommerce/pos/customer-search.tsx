import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Contact = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    profile_pic_url: string | null;
};

type Props = {
    customer: Contact | null;
    onSelect: (contact: Contact) => void;
    onClear: () => void;
};

export function CustomerSearch({ customer: contact, onSelect, onClear }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Contact[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (q: string) => {
        setSearch(q);
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(`/admin/woocommerce/pos/contacts?search=${encodeURIComponent(q)}`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const json = await res.json();
                setResults(json.data ?? []);
            }
        } catch {
            // ignore
        } finally {
            setSearching(false);
        }
    };

    if (contact) {
        return (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
                <div className="flex items-center gap-2 min-w-0">
                    {contact.profile_pic_url && (
                        <img
                            src={contact.profile_pic_url}
                            alt=""
                            className="size-8 rounded-full object-cover"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        {contact.phone && (
                            <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>
                        )}
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0">
                    Cambiar
                </Button>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                    Seleccionar cliente...
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Seleccionar Cliente</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <Input
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                    />
                    {searching && <p className="text-sm text-muted-foreground">Buscando...</p>}
                    {results.length === 0 && search.trim() && !searching && (
                        <p className="text-sm text-muted-foreground">Sin resultados. Crea el contacto desde el módulo Contacts.</p>
                    )}
                    {results.length > 0 && (
                        <div className="max-h-64 space-y-1 overflow-y-auto">
                            {results.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                                    onClick={() => {
                                        onSelect(c);
                                        setOpen(false);
                                    }}
                                >
                                    {c.profile_pic_url ? (
                                        <img src={c.profile_pic_url} alt="" className="size-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {[c.phone, c.email].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
