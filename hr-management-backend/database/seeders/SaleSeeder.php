<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $products = Product::all();

        // Sample customer names
        $customerNames = [
            'John Doe',
            'Jane Smith',
            'Bob Johnson',
            'Alice Williams',
            'Charlie Brown',
            'Diana Martinez',
            'Edward Davis',
            'Fiona Garcia',
            'George Rodriguez',
            'Helen Wilson',
            null, // Some sales without customer name
        ];

        // Create 20 sample sales
        for ($i = 1; $i <= 20; $i++) {
            $customerName = $customerNames[array_rand($customerNames)];
            $user = $users->random();

            // Random date within last 30 days
            $saleDate = now()->subDays(rand(0, 30));

            $sale = Sale::create([
                'customer_name' => $customerName,
                'user_id' => $user->id,
                'sale_date' => $saleDate,
                'subtotal' => 0,
                'total_amount' => 0,
                'payment_method' => ['cash', 'card', 'transfer', 'credit'][rand(0, 3)],
                'payment_status' => ['paid', 'pending', 'partial'][rand(0, 2)],
                'notes' => 'Sample sale #' . $i,
            ]);

            // Add 1-5 random items to each sale
            $numItems = rand(1, 5);
            $subtotal = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product = $products->random();
                $quantity = rand(1, 5);
                $unitPrice = $product->selling_price;
                $itemSubtotal = $unitPrice * $quantity;

                $sale->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'cost_price' => $product->cost_price,
                    'subtotal' => $itemSubtotal,
                ]);

                $subtotal += $itemSubtotal;

                // Update product stock
                $product->decrement('stock_quantity', $quantity);
            }

            // Update sale totals
            $totalAmount = $subtotal;

            $sale->update([
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
            ]);
        }
    }
}
