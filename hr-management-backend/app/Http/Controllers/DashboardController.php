<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview data.
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', 'today'); // today, week, month, year

        $startDate = $this->getStartDate($period);
        $endDate = now();

        // Sales data
        $salesQuery = Sale::whereBetween('sale_date', [$startDate, $endDate]);
        $totalSales = $salesQuery->sum('total_amount');
        $totalTransactions = $salesQuery->count();

        // Expenses data
        $expensesQuery = Expense::whereBetween('expense_date', [$startDate, $endDate]);
        $totalExpenses = $expensesQuery->sum('amount');

        // Profit calculation
        $salesWithItems = Sale::with('items')
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->get();

        $totalProfit = $salesWithItems->sum(function ($sale) {
            return $sale->total_profit;
        });

        $netProfit = $totalProfit - $totalExpenses;

        // Product statistics
        $lowStockProducts = Product::where('stock_quantity', '<=', 10)
            ->where('is_active', true)
            ->count();

        $totalProducts = Product::where('is_active', true)->count();

        // Top selling products
        $topProducts = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereBetween('sales.sale_date', [$startDate, $endDate])
            ->select(
                'products.id',
                'products.name',
                DB::raw('SUM(sale_items.quantity) as total_quantity'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        // Sales trend (daily breakdown)
        $salesTrend = Sale::whereBetween('sale_date', [$startDate, $endDate])
            ->selectRaw('DATE(sale_date) as date, SUM(total_amount) as total, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Recent sales
        $recentSales = Sale::with(['user', 'items.product'])
            ->latest('sale_date')
            ->limit(5)
            ->get();

        return response()->json([
            'period' => $period,
            'date_range' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_sales' => round($totalSales, 2),
                'total_transactions' => $totalTransactions,
                'total_expenses' => round($totalExpenses, 2),
                'gross_profit' => round($totalProfit, 2),
                'net_profit' => round($netProfit, 2),
                'profit_margin' => $totalSales > 0 ? round(($netProfit / $totalSales) * 100, 2) : 0,
            ],
            'products' => [
                'total_active' => $totalProducts,
                'low_stock_count' => $lowStockProducts,
            ],
            'top_products' => $topProducts,
            'sales_trend' => $salesTrend,
            'recent_sales' => $recentSales,
        ]);
    }

    /**
     * Get profit and loss report.
     */
    public function profitLoss(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'];
        $endDate = $validated['end_date'];

        // Revenue (Sales)
        $sales = Sale::whereBetween('sale_date', [$startDate, $endDate])
            ->sum('total_amount');

        $salesCount = Sale::whereBetween('sale_date', [$startDate, $endDate])
            ->count();

        // Cost of Goods Sold
        $salesWithItems = Sale::with('items')
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->get();

        $cogs = $salesWithItems->sum(function ($sale) {
            return $sale->total_cost;
        });

        $grossProfit = $sales - $cogs;

        // Operating Expenses
        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        $totalExpenses = $expenses->sum('total');

        // Net Profit
        $netProfit = $grossProfit - $totalExpenses;

        return response()->json([
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'revenue' => [
                'total_sales' => round($sales, 2),
                'number_of_transactions' => $salesCount,
            ],
            'cost_of_goods_sold' => round($cogs, 2),
            'gross_profit' => round($grossProfit, 2),
            'gross_profit_margin' => $sales > 0 ? round(($grossProfit / $sales) * 100, 2) : 0,
            'operating_expenses' => [
                'breakdown' => $expenses,
                'total' => round($totalExpenses, 2),
            ],
            'net_profit' => round($netProfit, 2),
            'net_profit_margin' => $sales > 0 ? round(($netProfit / $sales) * 100, 2) : 0,
        ]);
    }

    /**
     * Get start date based on period.
     */
    private function getStartDate(string $period)
    {
        return match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfDay(),
        };
    }
}
