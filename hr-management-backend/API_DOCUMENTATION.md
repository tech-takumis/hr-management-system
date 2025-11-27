# Sales Management System API Documentation

## Base URL
```
http://localhost:8000/api
```

All API endpoints require authentication using Laravel Sanctum tokens, except for authentication endpoints.

## Authentication

### Register
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "1|xxxxxxxxxxxx",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Logout
```http
POST /logout
Authorization: Bearer {token}
```

## Dashboard

### Get Dashboard Overview
```http
GET /api/dashboard?period={today|week|month|year}
Authorization: Bearer {token}

Response:
{
  "period": "today",
  "date_range": {
    "start": "2025-11-27",
    "end": "2025-11-27"
  },
  "summary": {
    "total_sales": 15000.00,
    "total_transactions": 25,
    "total_expenses": 5000.00,
    "gross_profit": 8000.00,
    "net_profit": 3000.00,
    "profit_margin": 20.00
  },
  "products": {
    "total_active": 50,
    "low_stock_count": 5
  },
  "top_products": [...],
  "sales_trend": [...],
  "recent_sales": [...]
}
```

### Get Profit & Loss Report
```http
GET /api/dashboard/profit-loss?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer {token}

Response:
{
  "period": {
    "start_date": "2025-11-01",
    "end_date": "2025-11-30"
  },
  "revenue": {
    "total_sales": 50000.00,
    "number_of_transactions": 100
  },
  "cost_of_goods_sold": 30000.00,
  "gross_profit": 20000.00,
  "gross_profit_margin": 40.00,
  "operating_expenses": {
    "breakdown": [...],
    "total": 10000.00
  },
  "net_profit": 10000.00,
  "net_profit_margin": 20.00
}
```

## Products

### List All Products
```http
GET /api/products?page=1&per_page=15&search=laptop&category=electronics&is_active=true&low_stock=false
Authorization: Bearer {token}
```

### Get Product Categories
```http
GET /api/products/categories
Authorization: Bearer {token}
```

### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laptop",
  "sku": "LAP-001",
  "description": "High-performance laptop",
  "cost_price": 500.00,
  "selling_price": 800.00,
  "stock_quantity": 50,
  "unit": "piece",
  "category": "Electronics",
  "is_active": true
}
```

### Get Product
```http
GET /api/products/{id}
Authorization: Bearer {token}
```

### Update Product
```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "selling_price": 850.00,
  "stock_quantity": 45
}
```

### Delete Product
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

## Sales

### List All Sales
```http
GET /api/sales?page=1&per_page=15&search=SALE-001&start_date=2025-11-01&end_date=2025-11-30&payment_status=paid&payment_method=cash
Authorization: Bearer {token}
```

### Get Sales Summary
```http
GET /api/sales/summary?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer {token}

Response:
{
  "total_sales": 50000.00,
  "total_transactions": 100,
  "average_transaction": 500.00,
  "total_tax": 5000.00,
  "total_discount": 2000.00
}
```

### Create Sale
```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 1,
  "sale_date": "2025-11-27",
  "payment_method": "cash",
  "payment_status": "paid",
  "tax": 100.00,
  "discount": 50.00,
  "notes": "Customer paid in full",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 800.00,
      "discount": 20.00
    },
    {
      "product_id": 2,
      "quantity": 1,
      "unit_price": 500.00,
      "discount": 0
    }
  ]
}
```

### Get Sale
```http
GET /api/sales/{id}
Authorization: Bearer {token}
```

### Update Sale
```http
PUT /api/sales/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "payment_status": "paid",
  "notes": "Payment received"
}
```

### Delete Sale
```http
DELETE /api/sales/{id}
Authorization: Bearer {token}
```

## Expenses

### List All Expenses
```http
GET /api/expenses?page=1&per_page=15&search=rent&start_date=2025-11-01&end_date=2025-11-30&category=rent
Authorization: Bearer {token}
```

### Get Expense Categories
```http
GET /api/expenses/categories
Authorization: Bearer {token}
```

### Get Expense Summary
```http
GET /api/expenses/summary?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer {token}

Response:
{
  "total_expenses": 10000.00,
  "expenses_by_category": [
    {
      "category": "Rent",
      "total": 5000.00
    },
    {
      "category": "Utilities",
      "total": 2000.00
    }
  ]
}
```

### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Rent",
  "description": "Office rent for November",
  "amount": 5000.00,
  "expense_date": "2025-11-01",
  "payment_method": "transfer",
  "receipt_number": "REC-001",
  "notes": "Paid via bank transfer"
}
```

### Get Expense
```http
GET /api/expenses/{id}
Authorization: Bearer {token}
```

### Update Expense
```http
PUT /api/expenses/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5500.00,
  "notes": "Amount updated"
}
```

### Delete Expense
```http
DELETE /api/expenses/{id}
Authorization: Bearer {token}
```

## Reports

### List All Reports
```http
GET /api/reports?page=1&per_page=15&report_type=daily
Authorization: Bearer {token}
```

### Generate Report
```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "report_type": "monthly",
  "start_date": "2025-11-01",
  "end_date": "2025-11-30"
}
```

### Get Sales Report
```http
GET /api/reports/sales?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer {token}
```

### Get Expense Report
```http
GET /api/reports/expenses?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer {token}
```

### Get Report
```http
GET /api/reports/{id}
Authorization: Bearer {token}
```

### Delete Report
```http
DELETE /api/reports/{id}
Authorization: Bearer {token}
```

## Filter & Search Options

### Common Query Parameters

- `page` - Page number for pagination (default: 1)
- `per_page` - Items per page (default: 15)
- `search` - Search term for filtering
- `start_date` - Start date for date range filtering (YYYY-MM-DD)
- `end_date` - End date for date range filtering (YYYY-MM-DD)

### Customer Filters
- `customer_type` - Filter by type: regular, wholesale, retail

### Product Filters
- `category` - Filter by category
- `is_active` - Filter by active status (true/false)
- `low_stock` - Show only low stock items (true/false)

### Sale Filters
- `payment_status` - Filter by status: paid, pending, partial
- `payment_method` - Filter by method: cash, card, transfer, credit

### Expense Filters
- `category` - Filter by expense category

## User Roles

The system supports different user roles:

- `user` - Basic user with limited access
- `secretary` - Can record sales and view reports
- `manager` - Full access to all features
- `admin` - System administrator

Role-based access control should be implemented in middleware based on your requirements.

## Error Responses

All API endpoints return standard error responses:

```json
{
  "message": "Error message",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error
