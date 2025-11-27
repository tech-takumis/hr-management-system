<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Laptop Dell XPS 15',
                'sku' => 'LAP-DELL-001',
                'description' => 'High-performance laptop for professionals',
                'cost_price' => 800.00,
                'selling_price' => 1200.00,
                'stock_quantity' => 25,
                'unit' => 'piece',
                'category' => 'Electronics',
                'is_active' => true,
            ],
            [
                'name' => 'Wireless Mouse Logitech',
                'sku' => 'ACC-LOG-001',
                'description' => 'Ergonomic wireless mouse',
                'cost_price' => 15.00,
                'selling_price' => 25.00,
                'stock_quantity' => 100,
                'unit' => 'piece',
                'category' => 'Accessories',
                'is_active' => true,
            ],
            [
                'name' => 'Office Chair Premium',
                'sku' => 'FUR-CHA-001',
                'description' => 'Ergonomic office chair with lumbar support',
                'cost_price' => 120.00,
                'selling_price' => 200.00,
                'stock_quantity' => 50,
                'unit' => 'piece',
                'category' => 'Furniture',
                'is_active' => true,
            ],
            [
                'name' => 'Samsung 27" Monitor',
                'sku' => 'MON-SAM-001',
                'description' => '4K Ultra HD monitor',
                'cost_price' => 250.00,
                'selling_price' => 400.00,
                'stock_quantity' => 30,
                'unit' => 'piece',
                'category' => 'Electronics',
                'is_active' => true,
            ],
            [
                'name' => 'Mechanical Keyboard RGB',
                'sku' => 'ACC-KEY-001',
                'description' => 'Gaming mechanical keyboard with RGB lighting',
                'cost_price' => 50.00,
                'selling_price' => 85.00,
                'stock_quantity' => 8,
                'unit' => 'piece',
                'category' => 'Accessories',
                'is_active' => true,
            ],
            [
                'name' => 'Desk Lamp LED',
                'sku' => 'FUR-LAM-001',
                'description' => 'Adjustable LED desk lamp',
                'cost_price' => 20.00,
                'selling_price' => 35.00,
                'stock_quantity' => 60,
                'unit' => 'piece',
                'category' => 'Furniture',
                'is_active' => true,
            ],
            [
                'name' => 'USB-C Hub Multi-port',
                'sku' => 'ACC-HUB-001',
                'description' => '7-in-1 USB-C hub adapter',
                'cost_price' => 25.00,
                'selling_price' => 45.00,
                'stock_quantity' => 5,
                'unit' => 'piece',
                'category' => 'Accessories',
                'is_active' => true,
            ],
            [
                'name' => 'Notebook A4 Pack',
                'sku' => 'STA-NOT-001',
                'description' => 'Pack of 5 A4 notebooks',
                'cost_price' => 8.00,
                'selling_price' => 15.00,
                'stock_quantity' => 120,
                'unit' => 'pack',
                'category' => 'Stationery',
                'is_active' => true,
            ],
            [
                'name' => 'Pen Set Premium',
                'sku' => 'STA-PEN-001',
                'description' => 'Set of 10 premium ballpoint pens',
                'cost_price' => 5.00,
                'selling_price' => 10.00,
                'stock_quantity' => 150,
                'unit' => 'set',
                'category' => 'Stationery',
                'is_active' => true,
            ],
            [
                'name' => 'Webcam HD 1080p',
                'sku' => 'ACC-WEB-001',
                'description' => 'Full HD webcam with microphone',
                'cost_price' => 40.00,
                'selling_price' => 70.00,
                'stock_quantity' => 35,
                'unit' => 'piece',
                'category' => 'Electronics',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['sku' => $product['sku']], // Match by SKU
                $product // Update or create with these values
            );
        }
    }
}
