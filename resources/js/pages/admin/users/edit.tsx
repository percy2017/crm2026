import { Head, router } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as adminUsersIndex } from '@/routes/admin/users';
import { update as adminUsersUpdate } from '@/routes/admin/users';
import type { User } from '@/types';

export default function UsersEdit({ user }: { user: User }) {
    const [values, setValues] = useState({
        name: user.name,
        email: user.email,
        password: '',
        is_admin: user.is_admin,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(adminUsersUpdate(user.id).url, values, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title={`Edit: ${user.name}`}
                    description="Update user information"
                />

                <form
                    onSubmit={handleSubmit}
                    className="max-w-lg space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={values.name}
                            onChange={(e) =>
                                setValues({ ...values, name: e.target.value })
                            }
                            placeholder="Full name"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={values.email}
                            onChange={(e) =>
                                setValues({ ...values, email: e.target.value })
                            }
                            placeholder="Email address"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            Password{' '}
                            <span className="text-muted-foreground text-xs">
                                (leave blank to keep current)
                            </span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={values.password}
                            onChange={(e) =>
                                setValues({
                                    ...values,
                                    password: e.target.value,
                                })
                            }
                            placeholder="New password"
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_admin"
                            checked={values.is_admin}
                            onCheckedChange={(checked) =>
                                setValues({
                                    ...values,
                                    is_admin: checked === true,
                                })
                            }
                        />
                        <Label htmlFor="is_admin">Administrator</Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save</Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => router.visit(adminUsersIndex().url)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
