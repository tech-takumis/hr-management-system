<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Manager user
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'role' => 'manager',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Secretary user
        User::create([
            'name' => 'Secretary User',
            'email' => 'secretary@example.com',
            'role' => 'secretary',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Regular user
        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'role' => 'user',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
    }
}
