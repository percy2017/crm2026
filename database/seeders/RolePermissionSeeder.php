<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Permission::create(['name' => 'access-admin']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = Role::create(['name' => 'admin']);
        Role::create(['name' => 'user']);

        $admin->givePermissionTo('access-admin');

        foreach (User::all() as $u) {
            $u->assignRole('admin');
        }
    }
}
