<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expenses.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::with('user');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('receipt_number', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->has('start_date')) {
            $query->whereDate('expense_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('expense_date', '<=', $request->end_date);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $expenses = $query->latest('expense_date')->paginate($request->get('per_page', 15));

        return response()->json($expenses);
    }

    /**
     * Store a newly created expense.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,transfer,check',
            'receipt_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();

        $expense = Expense::create($validated);

        return response()->json([
            'message' => 'Expense created successfully',
            'expense' => $expense,
        ], 201);
    }

    /**
     * Display the specified expense.
     */
    public function show(Expense $expense): JsonResponse
    {
        $expense->load('user');

        return response()->json($expense);
    }

    /**
     * Update the specified expense.
     */
    public function update(Request $request, Expense $expense): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'expense_date' => 'sometimes|required|date',
            'payment_method' => 'sometimes|required|in:cash,card,transfer,check',
            'receipt_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $expense->update($validated);

        return response()->json([
            'message' => 'Expense updated successfully',
            'expense' => $expense,
        ]);
    }

    /**
     * Remove the specified expense.
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json([
            'message' => 'Expense deleted successfully',
        ]);
    }

    /**
     * Get expense categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Expense::distinct('category')
            ->whereNotNull('category')
            ->pluck('category');

        return response()->json($categories);
    }

    /**
     * Get expense summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $query = Expense::query();

        // Date range filter
        if ($request->has('start_date')) {
            $query->whereDate('expense_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('expense_date', '<=', $request->end_date);
        }

        $totalExpenses = $query->sum('amount');
        $expensesByCategory = Expense::query()
            ->when($request->has('start_date'), fn($q) => $q->whereDate('expense_date', '>=', $request->start_date))
            ->when($request->has('end_date'), fn($q) => $q->whereDate('expense_date', '<=', $request->end_date))
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        return response()->json([
            'total_expenses' => $totalExpenses,
            'expenses_by_category' => $expensesByCategory,
        ]);
    }
}
