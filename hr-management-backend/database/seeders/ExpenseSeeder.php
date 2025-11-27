<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $expenses = [
            [
                'user_id' => $admin->id,
                'category' => 'Rent',
                'description' => 'Office rent for November 2025',
                'amount' => 2500.00,
                'expense_date' => now()->startOfMonth(),
                'payment_method' => 'transfer',
                'receipt_number' => 'RENT-2025-11',
                'notes' => 'Monthly office rent payment',
            ],
            [
                'user_id' => $admin->id,
                'category' => 'Utilities',
                'description' => 'Electricity bill',
                'amount' => 350.00,
                'expense_date' => now()->subDays(5),
                'payment_method' => 'transfer',
                'receipt_number' => 'ELEC-2025-11',
                'notes' => 'Monthly electricity payment',
            ],
            [
                'user_id' => $admin->id,
                'category' => 'Utilities',
                'description' => 'Internet service',
                'amount' => 100.00,
                'expense_date' => now()->subDays(10),
                'payment_method' => 'card',
                'receipt_number' => 'NET-2025-11',
                'notes' => 'Monthly internet subscription',
            ],
            [
                'user_id' => $admin->id,
                'category' => 'Salaries',
                'description' => 'Employee salaries for November',
                'amount' => 8000.00,
                'expense_date' => now()->endOfMonth(),
                'payment_method' => 'transfer',
                'receipt_number' => 'SAL-2025-11',
                'notes' => 'Monthly salary payments',
            ],
            [
                'user_id' => $admin->id,
                'category' => 'Supplies',
                'description' => 'Office supplies and stationery',
                'amount' => 200.00,
                'expense_date' => now()->subDays(15),
                'payment_method' => 'cash',
                'receipt_number' => 'SUP-2025-11-01',
                'notes' => 'Purchased office supplies',
            ],
            [
                'user_id' => $admin->id,
                'category' => 'Marketing',
                'description' => 'Social media advertising',
                'amount' => 500.00,
                'expense_date' => now()->subDays(7),
                'payment_method' => 'card',
                'receipt_number' => 'MKT-2025-11-01',
                'notes' => 'Facebook and Instagram ads',
            ],
            [
                'user_id' => $admin->id,
                'category' => 'Maintenance',
                'description' => 'Equipment maintenance and repairs',
                'amount' => 300.00,
                'expense_date' => now()->subDays(12),
                'payment_method' => 'cash',
                'receipt_number' => 'MAINT-2025-11-01',
                'notes' => 'Computer and printer maintenance',
            ],
        ];

        foreach ($expenses as $expense) {
            Expense::updateOrCreate(
                ['receipt_number' => $expense['receipt_number']], // Match by receipt number
                $expense // Update or create with these values
            );
        }
    }
}
