<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {

    // User endpoint
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'created_at' => $request->user()->created_at,
            ],
        ]);
    });

    // Dashboard routes
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/profit-loss', [DashboardController::class, 'profitLoss']);

    // Product routes
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::apiResource('products', ProductController::class);

    // Sales routes
    Route::get('/sales/summary', [SaleController::class, 'summary']);
    Route::apiResource('sales', SaleController::class);

    // Expense routes
    Route::get('/expenses/categories', [ExpenseController::class, 'categories']);
    Route::get('/expenses/summary', [ExpenseController::class, 'summary']);
    Route::apiResource('expenses', ExpenseController::class);

    // Report routes
    Route::post('/reports/generate', [ReportController::class, 'generate']);
    Route::get('/reports/sales', [ReportController::class, 'salesReport']);
    Route::get('/reports/expenses', [ReportController::class, 'expenseReport']);
    Route::apiResource('reports', ReportController::class)->only(['index', 'show', 'destroy']);
});
