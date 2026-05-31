<?php

use App\Models\User;
use function Pest\Laravel\actingAs;

test('the welcome page loads', function () {
    $page = visit('/');

    $page->assertSee('Log in');
    $page->assertSee('Register');
});

test('a user can log in', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $page = visit('/login');

    $page
        ->fill('email', $user->email)
        ->fill('password', 'password')
        ->press('Log in')
        ->assertSee('Dashboard');
});

test('an authenticated user sees the dashboard link', function () {
    $user = User::factory()->create();

    actingAs($user);

    $page = visit('/');

    $page->assertSee('Dashboard');
});
