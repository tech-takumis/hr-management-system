<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Display a listing of reports.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Report::with('user');

        // Filter by report type
        if ($request->has('report_type')) {
            $query->where('report_type', $request->report_type);
        }

        $reports = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($reports);
    }

    /**
     * Generate a new report.
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_type' => 'required|in:daily,weekly,monthly,custom,profit_loss',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $reportData = $this->generateReportData(
            $validated['report_type'],
            $validated['start_date'],
            $validated['end_date']
        );

        $report = Report::create([
            'user_id' => auth()->id(),
            'report_type' => $validated['report_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'data' => $reportData,
        ]);

        return response()->json([
            'message' => 'Report generated successfully',
            'report' => $report,
        ], 201);
    }

    /**
     * Display the specified report.
     */
    public function show(Report $report): JsonResponse
    {
        $report->load('user');

        return response()->json($report);
    }

    /**
     * Remove the specified report.
     */
    public function destroy(Report $report): JsonResponse
    {
        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully',
        ]);
    }

    /**
     * Generate sales report.
     */
    public function salesReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $sales = Sale::with(['customer', 'items.product', 'user'])
            ->whereBetween('sale_date', [$validated['start_date'], $validated['end_date']])
            ->get();

        $summary = [
            'total_sales' => $sales->sum('total_amount'),
            'total_transactions' => $sales->count(),
            'average_transaction' => $sales->avg('total_amount'),
            'total_tax' => $sales->sum('tax'),
            'total_discount' => $sales->sum('discount'),
            'payment_methods' => $sales->groupBy('payment_method')->map(fn($group) => [
                'count' => $group->count(),
                'total' => $group->sum('total_amount'),
            ]),
        ];

        return response()->json([
            'period' => [
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
            ],
            'summary' => $summary,
            'sales' => $sales,
        ]);
    }

    /**
     * Generate expense report.
     */
    public function expenseReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $expenses = Expense::with('user')
            ->whereBetween('expense_date', [$validated['start_date'], $validated['end_date']])
            ->get();

        $summary = [
            'total_expenses' => $expenses->sum('amount'),
            'total_transactions' => $expenses->count(),
            'by_category' => $expenses->groupBy('category')->map(fn($group) => [
                'count' => $group->count(),
                'total' => $group->sum('amount'),
            ]),
        ];

        return response()->json([
            'period' => [
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
            ],
            'summary' => $summary,
            'expenses' => $expenses,
        ]);
    }

    /**
     * Generate report data based on type.
     */
    private function generateReportData(string $type, string $startDate, string $endDate): array
    {
        $sales = Sale::whereBetween('sale_date', [$startDate, $endDate])->get();
        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->get();

        $totalSales = $sales->sum('total_amount');
        $totalExpenses = $expenses->sum('amount');
        $grossProfit = $sales->sum(function ($sale) {
            return $sale->total_profit;
        });
        $netProfit = $grossProfit - $totalExpenses;

        return [
            'sales' => [
                'total' => $totalSales,
                'count' => $sales->count(),
                'average' => $sales->avg('total_amount'),
            ],
            'expenses' => [
                'total' => $totalExpenses,
                'count' => $expenses->count(),
            ],
            'profit' => [
                'gross' => $grossProfit,
                'net' => $netProfit,
                'margin' => $totalSales > 0 ? ($netProfit / $totalSales) * 100 : 0,
            ],
        ];
    }
}
