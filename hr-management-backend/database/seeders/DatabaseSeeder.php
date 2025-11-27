<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
//        // Create default admin user if doesn't exist
//        User::updateOrCreate(
//            ['email' => 'admin@example.com'],
//            [
//                'name' => 'Admin User',
//                'email' => 'admin@gmail.com',
//                'password' => bcrypt('password'),
//                'role' => 'admin',
//                'email_verified_at' => now(),
//            ]
//        );
//
//        // Create default regular user if doesn't exist
//        User::updateOrCreate(
//            ['email' => 'user@gmail.com'],
//            [
//                'name' => 'Regular User',
//                'email' => 'user@example.com',
//                'password' => bcrypt('password'),
//                'role' => 'user',
//                'email_verified_at' => now(),
//            ]
//        );

        $this->call([
            CustomerSeeder::class,
            ProductSeeder::class,
            ExpenseSeeder::class,
            SaleSeeder::class,
        ]);
    }
}
