import { Head, router } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as adminUsersStore } from '@/routes/admin/users';
import { index as adminUsersIndex } from '@/routes/admin/users';

type Props = {
    roles: string[];
};

export default function UsersCreate({ roles }: Props) {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const toggleRole = (role: string) => {
        setValues((prev) => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter((r) => r !== role)
                : [...prev.roles, role],
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post(adminUsersStore().url, values, {
            onError: (errs) => setErrors(errs),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Create User" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Heading
                    title="Create User"
                    description="Add a new user to the system"
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
                        <Label htmlFor="password">Password</Label>
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
                            placeholder="Password"
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Roles</Label>
                        <div className="flex flex-wrap gap-4">
                            {roles.map((role) => (
                                <div key={role} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`role-${role}`}
                                        checked={values.roles.includes(role)}
                                        onCheckedChange={() => toggleRole(role)}
                                    />
                                    <Label htmlFor={`role-${role}`} className="capitalize">
                                        {role}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.roles} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create</Button>
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
