# Sales Management System - Setup Guide

## Overview

This is a comprehensive HR/Sales Management System built with Laravel 12. It provides complete functionality for managing sales, customers, products, expenses, and generating detailed reports.

## Features Implemented

### 1. Sales Entry Module
- Create, update, and delete sales records
- Add multiple items per sale with individual pricing and discounts
- Track payment methods (cash, card, transfer, credit)
- Monitor payment status (paid, pending, partial)
- Automatic sale number generation
- Real-time stock updates

### 2. Sales Summary Dashboard
- Real-time sales statistics by period (today, week, month, year)
- Visual performance metrics including profit margins
- Top-selling products analysis
- Sales trend tracking
- Recent transactions view

### 3. Search and Filter Tools
- Advanced search across all modules
- Date range filtering
- Category and status filters
- Payment method filters
- Customer type filters

### 4. Automated Reports
- Daily, weekly, monthly, and custom reports
- Sales reports with detailed breakdowns
- Expense reports by category
- Automated report generation and storage
- Exportable report data

### 5. User Accounts and Access Control
- Role-based access (admin, manager, secretary, user)
- Secure authentication with Laravel Sanctum
- Email verification support
- Password reset functionality

### 6. Backup and Data Security
- Soft deletes for data recovery
- Transaction-based operations
- Database integrity with foreign key constraints
- Secure API with token authentication

### 7. Dashboard
- Comprehensive business metrics
- Total sales and revenue tracking
- Profit and loss calculations
- Product inventory monitoring
- Low stock alerts

### 8. Sales Record Module
- Complete sales history
- Customer purchase tracking
- Product sales analytics
- Transaction audit trail

### 9. Profit and Loss Module
- Gross profit calculation
- Net profit after expenses
- Cost of goods sold (COGS) tracking
- Profit margin percentages
- Period-based P&L reports

### 10. Reports Module
- Customizable date range reports
- Category-based analysis
- Export-ready data formats
- Historical report storage

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- PostgreSQL or SQLite
- Docker (optional)

### Step 1: Install Dependencies
```bash
composer install
```

### Step 2: Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 3: Configure Database

#### Option A: Using SQLite (Default)
The project is pre-configured for SQLite. No additional setup needed.

#### Option B: Using PostgreSQL with Docker
```bash
# Start PostgreSQL container
docker-compose up -d

# Update .env file
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5434
DB_DATABASE=hr-management
DB_USERNAME=hr-management
DB_PASSWORD=hr-management
```

### Step 4: Run Migrations
```bash
php artisan migrate
```

### Step 5: Seed Database (Optional)
```bash
php artisan db:seed
```

This will create:
- 4 users with different roles (admin, manager, secretary, user)
- 5 sample customers
- 10 sample products
- 7 sample expenses
- 20 sample sales transactions

**Default User Credentials:**
- Admin: admin@example.com / password
- Manager: manager@example.com / password
- Secretary: secretary@example.com / password
- User: user@example.com / password

### Step 6: Start Development Server
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

## Testing the API

### 1. Login to Get Token
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Save the returned token for authenticated requests.

### 2. Get Dashboard Data
```bash
curl -X GET "http://localhost:8000/api/dashboard?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Create a Sale
```bash
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "sale_date": "2025-11-27",
    "payment_method": "cash",
    "payment_status": "paid",
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "unit_price": 1200.00,
        "discount": 0
      }
    ]
  }'
```

### 4. View Sales Summary
```bash
curl -X GET "http://localhost:8000/api/sales/summary?start_date=2025-11-01&end_date=2025-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Generate Profit & Loss Report
```bash
curl -X GET "http://localhost:8000/api/dashboard/profit-loss?start_date=2025-11-01&end_date=2025-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### Tables Created
1. **users** - System users with role-based access
2. **customers** - Customer information and types
3. **products** - Product catalog with pricing and inventory
4. **sales** - Sales transactions header
5. **sale_items** - Individual items in each sale
6. **expenses** - Business expense records
7. **reports** - Generated report storage

### Key Relationships
- Sales → User (who recorded the sale)
- Sales → Customer (optional)
- Sales → Sale Items (one-to-many)
- Sale Items → Products
- Expenses → User

## API Endpoints Summary

### Authentication
- POST /register - Register new user
- POST /login - Login and get token
- POST /logout - Logout current session

### Dashboard
- GET /api/dashboard - Get overview metrics
- GET /api/dashboard/profit-loss - Get P&L report

### Customers
- GET /api/customers - List all customers
- POST /api/customers - Create customer
- GET /api/customers/{id} - Get customer details
- PUT /api/customers/{id} - Update customer
- DELETE /api/customers/{id} - Delete customer

### Products
- GET /api/products - List all products
- GET /api/products/categories - Get product categories
- POST /api/products - Create product
- GET /api/products/{id} - Get product details
- PUT /api/products/{id} - Update product
- DELETE /api/products/{id} - Delete product

### Sales
- GET /api/sales - List all sales
- GET /api/sales/summary - Get sales summary
- POST /api/sales - Create sale
- GET /api/sales/{id} - Get sale details
- PUT /api/sales/{id} - Update sale
- DELETE /api/sales/{id} - Delete sale

### Expenses
- GET /api/expenses - List all expenses
- GET /api/expenses/categories - Get expense categories
- GET /api/expenses/summary - Get expense summary
- POST /api/expenses - Create expense
- GET /api/expenses/{id} - Get expense details
- PUT /api/expenses/{id} - Update expense
- DELETE /api/expenses/{id} - Delete expense

### Reports
- GET /api/reports - List all reports
- POST /api/reports/generate - Generate new report
- GET /api/reports/sales - Get sales report
- GET /api/reports/expenses - Get expense report
- GET /api/reports/{id} - Get report details
- DELETE /api/reports/{id} - Delete report

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── CustomerController.php
│   │   ├── ProductController.php
│   │   ├── SaleController.php
│   │   ├── ExpenseController.php
│   │   ├── DashboardController.php
│   │   └── ReportController.php
│   └── Resources/
│       ├── CustomerResource.php
│       ├── ProductResource.php
│       ├── SaleResource.php
│       ├── SaleItemResource.php
│       ├── ExpenseResource.php
│       └── ReportResource.php
└── Models/
    ├── Customer.php
    ├── Product.php
    ├── Sale.php
    ├── SaleItem.php
    ├── Expense.php
    └── Report.php

database/
├── migrations/
│   ├── 2025_11_27_000001_add_role_to_users_table.php
│   ├── 2025_11_27_000002_create_customers_table.php
│   ├── 2025_11_27_000003_create_products_table.php
│   ├── 2025_11_27_000004_create_sales_table.php
│   ├── 2025_11_27_000005_create_sale_items_table.php
│   ├── 2025_11_27_000006_create_expenses_table.php
│   └── 2025_11_27_000007_create_reports_table.php
└── seeders/
    ├── UserSeeder.php
    ├── CustomerSeeder.php
    ├── ProductSeeder.php
    ├── ExpenseSeeder.php
    └── SaleSeeder.php

routes/
└── api.php - All API routes
```

## Development Tips

### Running Tests
```bash
composer test
```

### Code Formatting
```bash
./vendor/bin/pint
```

### Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Reset Database
```bash
php artisan migrate:fresh --seed
```

## Common Issues and Solutions

### Issue: "Class not found" errors
**Solution:** Run `composer dump-autoload`

### Issue: "SQLSTATE connection refused"
**Solution:**
- Check if database is running
- Verify .env database credentials
- For Docker: Ensure container is running with `docker-compose ps`

### Issue: "Unauthenticated" on API calls
**Solution:**
- Ensure you're passing the Bearer token in Authorization header
- Check if token is still valid
- Re-login to get a new token

### Issue: Stock quantity issues
**Solution:**
- Sales automatically decrease stock
- Deleting a sale restores the stock
- Check product stock_quantity before creating sales

## Next Steps

1. Implement role-based middleware for access control
2. Add file upload for product images
3. Implement PDF export for reports
4. Add email notifications for low stock
5. Create automated backup system
6. Add analytics charts/graphs
7. Implement multi-currency support
8. Add batch operations for bulk updates

## Support

For issues or questions:
1. Check the API documentation
2. Review the code comments in controllers and models
3. Check Laravel documentation: https://laravel.com/docs

## License

This project is built for HR Management System purposes.
