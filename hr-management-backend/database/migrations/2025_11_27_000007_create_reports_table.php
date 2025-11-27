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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who generated the report
            $table->string('report_type'); // daily, weekly, monthly, custom, profit_loss
            $table->date('start_date');
            $table->date('end_date');
            $table->json('data'); // store report data in JSON format
            $table->string('file_path')->nullable(); // if report is saved as file
            $table->timestamps();

            $table->index(['report_type', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
