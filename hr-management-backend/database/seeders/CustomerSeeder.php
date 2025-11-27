<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'ABC Corporation',
                'email' => 'contact@abc.com',
                'phone' => '1234567890',
                'address' => '123 Business St, City',
                'customer_type' => 'wholesale',
            ],
            [
                'name' => 'XYZ Retail Store',
                'email' => 'info@xyz.com',
                'phone' => '0987654321',
                'address' => '456 Market Ave, Town',
                'customer_type' => 'retail',
            ],
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '5551234567',
                'address' => '789 Main St, Village',
                'customer_type' => 'regular',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'phone' => '5559876543',
                'address' => '321 Oak Rd, City',
                'customer_type' => 'regular',
            ],
            [
                'name' => 'Tech Solutions Inc',
                'email' => 'sales@techsolutions.com',
                'phone' => '5555555555',
                'address' => '999 Innovation Blvd, Metro',
                'customer_type' => 'wholesale',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
