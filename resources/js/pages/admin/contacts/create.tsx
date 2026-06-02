import { Head, Link, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countryFlag } from '@/lib/utils';
import { index as adminContactsIndex } from '@/routes/admin/contacts';
import { upload as mediaUpload } from '@/routes/admin/media';

type FormValues = {
    name: string;
    phone: string;
    whatsapp_id: string;
    email: string;
    notes: string;
    profile_pic_url: string;
    is_active: boolean;
    is_business: boolean;
    country: string;
};

function getCsrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

export default function ContactsCreate({ countries }: { countries: string[] }) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [values, setValues] = useState<FormValues>({
        name: '',
        phone: '',
        whatsapp_id: '',
        email: '',
        notes: '',
        profile_pic_url: '',
        is_active: true,
        is_business: false,
        country: '',
    });

    const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(mediaUpload().url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: formData,
            });

            if (!res.ok) {
throw new Error('Upload failed');
}

            const data = await res.json();
            setValues((prev) => ({ ...prev, profile_pic_url: data.filename }));
        } catch {
            // ignore
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        router.post('/admin/contacts', values, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setLoading(false),
        });
    };

    const picPreview = values.profile_pic_url && !values.profile_pic_url.startsWith('http')
        ? `/storage/${values.profile_pic_url}`
        : values.profile_pic_url;

    return (
        <>
            <Head title="Create Contact" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Create Contact"
                    description="Add a new contact manually"
                />

                <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="text-sm font-medium">Contact Info</h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={values.name}
                                onChange={handleChange('name')}
                                placeholder="Full name"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={values.phone}
                                onChange={handleChange('phone')}
                                placeholder="59169375664"
                            />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        {values.whatsapp_id && (
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_id">WhatsApp ID</Label>
                                <Input
                                    id="whatsapp_id"
                                    value={values.whatsapp_id}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={values.email}
                                onChange={handleChange('email')}
                                placeholder="email@example.com"
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                value={values.notes}
                                onChange={handleChange('notes')}
                                placeholder="Additional notes..."
                                rows={3}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <div className="flex items-center gap-2">
                                <select
                                    id="country"
                                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                                    value={values.country}
                                    onChange={(e) => setValues((prev) => ({ ...prev, country: e.target.value }))}
                                >
                                    <option value="">Auto-detect</option>
                                    {countries.map((c) => (
                                        <option key={c} value={c}>
                                            {countryFlag(c)} {c.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                                {values.country && (
                                    <span className="text-lg">{countryFlag(values.country)}</span>
                                )}
                            </div>
                        </div>

                        {picPreview && (
                            <div>
                                <Label>Photo</Label>
                                <img src={picPreview} alt="Preview" className="mt-1 size-16 rounded-full border object-cover" referrerPolicy="no-referrer" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Avatar</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Avatar'}
                                </Button>
                                {values.profile_pic_url && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setValues((prev) => ({ ...prev, profile_pic_url: '' }))}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={values.is_active}
                                onCheckedChange={(checked) => setValues((prev) => ({ ...prev, is_active: checked === true }))}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_business"
                                checked={values.is_business}
                                onCheckedChange={(checked) => setValues((prev) => ({ ...prev, is_business: checked === true }))}
                            />
                            <Label htmlFor="is_business" className="cursor-pointer">Business Account</Label>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Contact'}
                        </Button>
                        <Link href={adminContactsIndex().url}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}
