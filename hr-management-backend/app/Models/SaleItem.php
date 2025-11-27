<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'product_id',
        'quantity',
        'unit_price',
        'cost_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /**
     * Get the sale this item belongs to.
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Get the product for this sale item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate profit for this item.
     */
    public function getProfitAttribute()
    {
        return ($this->unit_price - $this->cost_price) * $this->quantity;
    }

    /**
     * Calculate total cost for this item.
     */
    public function getTotalCostAttribute()
    {
        return $this->cost_price * $this->quantity;
    }
}
