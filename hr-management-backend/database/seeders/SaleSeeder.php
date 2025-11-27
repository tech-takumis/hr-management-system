<?php

namespace Database\Seeders;

use App\Models\Sale;
use App\Models\Product;
use App\Models\Customer;
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
        $customers = Customer::all();
        $products = Product::all();

        // Create 20 sample sales
        for ($i = 1; $i <= 20; $i++) {
            $customer = $customers->random();
            $user = $users->random();

            // Random date within last 30 days
            $saleDate = now()->subDays(rand(0, 30));

            $sale = Sale::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'sale_date' => $saleDate,
                'subtotal' => 0,
                'tax' => 0,
                'discount' => 0,
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
                $discount = rand(0, 1) ? rand(0, 50) : 0;
                $itemSubtotal = ($unitPrice * $quantity) - $discount;

                $sale->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'cost_price' => $product->cost_price,
                    'discount' => $discount,
                    'subtotal' => $itemSubtotal,
                ]);

                $subtotal += $itemSubtotal;

                // Update product stock
                $product->decrement('stock_quantity', $quantity);
            }

            // Update sale totals
            $tax = $subtotal * 0.1; // 10% tax
            $saleDiscount = rand(0, 1) ? rand(0, 100) : 0;
            $totalAmount = $subtotal + $tax - $saleDiscount;

            $sale->update([
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $saleDiscount,
                'total_amount' => $totalAmount,
            ]);
        }
    }
}
