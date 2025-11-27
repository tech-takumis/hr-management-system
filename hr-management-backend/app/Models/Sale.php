<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_number',
        'customer_name',
        'user_id',
        'sale_date',
        'subtotal',
        'tax',
        'discount',
        'total_amount',
        'payment_method',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Boot method for model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($sale) {
            if (empty($sale->sale_number)) {
                $sale->sale_number = self::generateSaleNumber();
            }
        });
    }

    /**
     * Generate unique sale number.
     */
    public static function generateSaleNumber(): string
    {
        $date = now()->format('Ymd');
        $lastSale = self::whereDate('created_at', now())->latest('id')->first();
        $number = $lastSale ? (int) substr($lastSale->sale_number, -4) + 1 : 1;

        return 'SALE-' . $date . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get the user who recorded this sale.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all items for this sale.
     */
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Calculate total profit for this sale.
     */
    public function getTotalProfitAttribute()
    {
        return $this->items->sum(function ($item) {
            return ($item->unit_price - $item->cost_price) * $item->quantity;
        });
    }

    /**
     * Calculate total cost for this sale.
     */
    public function getTotalCostAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->cost_price * $item->quantity;
        });
    }
}
