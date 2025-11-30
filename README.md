# Laravel and Vue Project with Docker container

A modern Laravel application built with **PHP 8.3**, following best practices for development, testing, and deployment.
## Note
Make sure to have php 8.3 installed.

## 🚀 Requirements

### First run the postgresql container using the following command:
```bash
  # Open the command prompt:
  docker-compose  up -d
```

Before installation, make sure your system has:

- **PHP 8.3+**
- **Composer 2.x**
- **PostgreSQL**
- **Node.js 18+ & npm**
- **Git**

---

## 🏗️ Installation Guide

Clone the repository:

```bash
git clone https://github.com/tech-takumis/hr-management-system.git
cd hr-management-system
```

```bash
composer install
```

```bash
cp .env.example .env
php artisan key:generate
```
```bash
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5434
DB_DATABASE=hr-management
DB_USERNAME=hr-management
DB_PASSWORD=hr-management
```

```bash
#php artisan migrate

Seed all data:
php artisan db:seed --class=ExpenseSeeder
php artisan db:seed --class=ProductSeeder
php artisan db:seed --class=SaleSeeder
```
```bash
php artisan serve
```

# 📦 Frontend (Vite)

## Install frontend dependencies:

```bash
npm install
npm audit fix --force
npm run dev
```




