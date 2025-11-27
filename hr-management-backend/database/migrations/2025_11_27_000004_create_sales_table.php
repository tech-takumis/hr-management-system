<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_number')->unique();
            $table->string('customer_name')->nullable(); // Simple customer name field
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who recorded the sale
            $table->date('sale_date');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('payment_method')->default('cash'); // cash, card, transfer, credit
            $table->string('payment_status')->default('paid'); // paid, pending, partial
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('sale_date');
            $table->index('sale_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
