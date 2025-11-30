<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    /**
     * Display a listing of sales.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with(['user', 'items.product']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sale_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->has('start_date')) {
            $query->whereDate('sale_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('sale_date', '<=', $request->end_date);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by payment method
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $sales = $query->latest('sale_date')->paginate($request->get('per_page', 15));

        return response()->json($sales);
    }

    /**
     * Store a newly created sale.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'sale_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,transfer,credit',
            'payment_status' => 'required|in:paid,pending,partial',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Calculate totals
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $itemSubtotal = $item['unit_price'] * $item['quantity'];
                $subtotal += $itemSubtotal;
            }

            $totalAmount = $subtotal;

            // Create sale
            $sale = Sale::create([
                'customer_name' => $validated['customer_name'] ?? null,
                'user_id' => auth()->id(),
                'sale_date' => $validated['sale_date'],
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Create sale items and update stock
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                $itemSubtotal = $item['unit_price'] * $item['quantity'];

                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'cost_price' => $product->cost_price,
                    'subtotal' => $itemSubtotal,
                ]);

                // Decrease stock
                $product->decreaseStock($item['quantity']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Sale created successfully',
                'sale' => $sale->load(['items.product']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create sale',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(Sale $sale): JsonResponse
    {
        $sale->load(['user', 'items.product']);

        return response()->json($sale);
    }

    /**
     * Update the specified sale.
     */
    public function update(Request $request, Sale $sale): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => 'sometimes|required|in:paid,pending,partial',
            'notes' => 'nullable|string',
        ]);

        $sale->update($validated);

        return response()->json([
            'message' => 'Sale updated successfully',
            'sale' => $sale->load(['items.product']),
        ]);
    }

    /**
     * Remove the specified sale.
     */
    public function destroy(Sale $sale): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Restore stock quantities
            foreach ($sale->items as $item) {
                $item->product->increaseStock($item->quantity);
            }

            $sale->delete();

            DB::commit();

            return response()->json([
                'message' => 'Sale deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete sale',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sales summary statistics.
     */
    public function summary(Request $request): JsonResponse
    {
        $query = Sale::query();

        // Date range filter
        if ($request->has('start_date')) {
            $query->whereDate('sale_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('sale_date', '<=', $request->end_date);
        }

        $totalSales = $query->sum('total_amount');
        $totalTransactions = $query->count();
        $averageTransaction = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;

        return response()->json([
            'total_sales' => $totalSales,
            'total_transactions' => $totalTransactions,
            'average_transaction' => round($averageTransaction, 2),
        ]);
    }

    /**
     * Get sales by date range using sale_date field.
     */
    public function getSalesByDateRange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $sales = Sale::with(['user', 'items.product'])
            ->whereDate('sale_date', '>=', $validated['start_date'])
            ->whereDate('sale_date', '<=', $validated['end_date'])
            ->orderBy('sale_date', 'asc')
            ->get();

        return response()->json([
            'sales' => $sales,
        ]);
    }
}
