# MSME Vendor Payment Tracking System

A comprehensive backend API system for managing vendors, purchase orders, and payments for MSMEs (Micro, Small, and Medium Enterprises). Built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Features (All Implemented)

#### 1. Vendor Management ✅
- Create, read, update vendors
- Unique vendor name and email validation
- Payment terms configuration (7, 15, 30, 45, 60 days)
- Active/Inactive status management
- Payment summary per vendor

#### 2. Purchase Order Management ✅
- Auto-generated PO numbers (PO-YYYYMMDD-XXX)
- Multiple line items with quantity and unit price
- Auto-calculated total amount and due date
- Status flow: Draft → Approved → Partially Paid → Fully Paid
- Filtering by vendor and status
- Pagination support (default 20, max 100)

#### 3. Payment Recording ✅
- Auto-generated payment references (PAY-YYYYMMDD-XXX)
- Multiple payment methods (Cash, Cheque, NEFT, RTGS, UPI)
- Outstanding amount validation
- Auto-update PO status on payment
- Database transactions for data integrity
- Soft delete with status recalculation

#### 4. Analytics ✅
- Vendor outstanding balances
- Payment aging report (0-30, 31-60, 61-90, 90+ days)
- Overdue tracking

### Bonus Features Implemented ✅
- JWT Authentication (hardcoded user)
- Swagger/OpenAPI documentation
- Pagination on all list endpoints
- Soft deletes for payments
- Database seed script with realistic data
- Production-ready error handling
- Centralized validation

## 📋 Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Railway/Render ready

## 🛠️ Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

## 📦 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd msme-payment-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
NODE_ENV=development
PORT=3000

DATABASE_URL = your-postgresql-string

JWT_SECRET=your-super-secret-jwt-key
```

### 4. Database setup
```bash
# Create database
createdb msme_payment_tracker

# The app uses synchronize=true in development, so tables will be auto-created
# For production, use migrations
```

### 5. Run the application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 6. Seed the database (optional)
```bash
npm run seed
```

This creates:
- 5 vendors
- 15 purchase orders
- 10 payments

## 🔑 Authentication

### Login Credentials (Hardcoded)
```json
{
  "email": "admin@qistonpe.com",
  "password": "password123"
}
```

### Getting JWT Token
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@qistonpe.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "admin@qistonpe.com",
    "name": "Admin User"
  }
}
```

### Using the token
Add to all subsequent requests:
```
Authorization: Bearer <access_token>
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login and get JWT token |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vendors` | Create a new vendor |
| GET | `/vendors` | Get all vendors |
| GET | `/vendors/:id` | Get vendor with payment summary |
| PUT | `/vendors/:id` | Update vendor information |

### Purchase Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/purchase-orders` | Create a new purchase order |
| GET | `/purchase-orders` | Get all POs (with filters) |
| GET | `/purchase-orders/:id` | Get PO with payment history |
| PATCH | `/purchase-orders/:id/status` | Update PO status |

**Query Parameters for GET /purchase-orders**:
- `vendorId` (UUID): Filter by vendor
- `status` (enum): Filter by status
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments` | Record a payment |
| GET | `/payments` | Get all payments (paginated) |
| GET | `/payments/:id` | Get payment details |
| DELETE | `/payments/:id` | Void a payment (soft delete) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/vendor-outstanding` | Outstanding balance by vendor |
| GET | `/analytics/payment-aging` | Payment aging report |

## 🧪 Testing the API

### Swagger Documentation
Visit: `http://localhost:3000/api/docs`

### Sample Request Flow

#### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@qistonpe.com",
    "password": "password123"
  }'
```

#### 2. Create Vendor
```bash
curl -X POST http://localhost:3000/vendors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions Ltd",
    "contactPerson": "John Doe",
    "email": "john@techsolutions.com",
    "phone": "+91-9876543210",
    "paymentTerms": 30,
    "status": "ACTIVE"
  }'
```

#### 3. Create Purchase Order
```bash
curl -X POST http://localhost:3000/purchase-orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "<vendor-uuid>",
    "poDate": "2026-01-18",
    "items": [
      {
        "description": "Laptop Dell XPS 15",
        "quantity": 10,
        "unitPrice": 85000
      }
    ],
    "status": "APPROVED"
  }'
```

#### 4. Record Payment
```bash
curl -X POST http://localhost:3000/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "<po-uuid>",
    "paymentDate": "2026-01-18",
    "amount": 500000,
    "paymentMethod": "NEFT",
    "notes": "Partial payment for Q1"
  }'
```

#### 5. Get Vendor Outstanding
```bash
curl -X GET http://localhost:3000/analytics/vendor-outstanding \
  -H "Authorization: Bearer <token>"
```

## 🗄️ Database Schema

### Tables

#### vendors
- `id` (UUID, PK)
- `name` (Unique)
- `contactPerson`
- `email` (Unique)
- `phone`
- `paymentTerms` (7, 15, 30, 45, 60)
- `status` (ACTIVE, INACTIVE)
- `createdAt`, `updatedAt`, `deletedAt`

#### purchase_orders
- `id` (UUID, PK)
- `poNumber` (Unique, Auto-generated)
- `vendorId` (FK → vendors)
- `poDate`
- `totalAmount` (Auto-calculated)
- `dueDate` (Auto-calculated)
- `status` (DRAFT, APPROVED, PARTIALLY_PAID, FULLY_PAID)
- `createdAt`, `updatedAt`, `deletedAt`

#### purchase_order_items
- `id` (UUID, PK)
- `purchaseOrderId` (FK → purchase_orders)
- `description`
- `quantity`
- `unitPrice`
- `lineTotal` (Auto-calculated)

#### payments
- `id` (UUID, PK)
- `paymentReference` (Unique, Auto-generated)
- `purchaseOrderId` (FK → purchase_orders)
- `paymentDate`
- `amount`
- `paymentMethod` (CASH, CHEQUE, NEFT, RTGS, UPI)
- `notes`
- `createdAt`, `updatedAt`, `deletedAt`

### Relationships
- One Vendor → Many Purchase Orders
- One Purchase Order → Many Purchase Order Items
- One Purchase Order → Many Payments

### Normalization
Database is in **3NF (Third Normal Form)**:
- No repeating groups
- All non-key attributes depend on the primary key
- No transitive dependencies

## 🏗️ Architecture & Design Decisions

### 1. Module Structure
Organized by business domain:
- `auth`: JWT authentication
- `vendors`: Vendor management
- `purchase-orders`: PO management
- `payments`: Payment recording
- `analytics`: Reporting and analytics

### 2. Service Layer Pattern
- Controllers: Handle HTTP requests/responses
- Services: Business logic and data operations
- Repositories: Database access (TypeORM)

### 3. DTO Validation
All DTOs use `class-validator` decorators for:
- Type validation
- Required fields
- Email format
- Enum values
- Positive numbers

### 4. Error Handling
- Global exception filter
- Proper HTTP status codes (200, 201, 400, 404, 409, 500)
- Meaningful error messages
- Transaction rollback on failures

### 5. Auto-calculations
- **PO Total**: Sum of all line items (quantity × unit price)
- **Due Date**: PO date + vendor payment terms
- **PO Status**: Auto-updated based on payments
  - Total paid = PO amount → FULLY_PAID
  - Total paid < PO amount → PARTIALLY_PAID

### 6. Data Integrity
- Database transactions for payment recording
- Foreign key constraints
- Soft deletes with status recalculation
- Unique constraints on critical fields

### 7. Performance Optimization
- Eager loading for frequently accessed relations
- Query filtering at database level
- Pagination to limit result sets
- Indexes on foreign keys (auto-created by TypeORM)

### 8. Security
- JWT authentication on all routes (except login)
- Password validation (hardcoded for demo)
- Input validation and sanitization
- SQL injection prevention (TypeORM parameterized queries)

## 🚀 Deployment

### Railway
1. Create new project on Railway
2. Add PostgreSQL database
3. Connect GitHub repository
4. Set environment variables from Railway dashboard
5. Deploy

### Render
1. Create new Web Service
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Build command: `npm install && npm run build`
6. Start command: `npm run start:prod`

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<provided-by-platform>
JWT_SECRET=<strong-secret-key>
```

## ⏱️ Time Breakdown

- **Database Design & Schema**: 2 hours
  - Entity design
  - Relationships
  - Validation rules

- **API Development**: 8 hours
  - Vendors module: 1.5 hours
  - Purchase Orders module: 2.5 hours
  - Payments module: 2 hours
  - Analytics module: 1 hour
  - Auth & Guards: 1 hour

- **Testing & Debugging**: 2 hours
  - Manual API testing
  - Business logic validation
  - Error handling

- **Documentation & Seed Script**: 1.5 hours
  - README
  - Swagger annotations
  - Seed data

**Total**: ~13.5 hours

## 🎯 Key Business Rules Implemented

1. ✅ Vendor name and email must be unique
2. ✅ Cannot create PO for inactive vendor
3. ✅ PO total auto-calculated from items
4. ✅ Due date auto-calculated from payment terms
5. ✅ Status transitions validated
6. ✅ Payment cannot exceed outstanding amount
7. ✅ PO status auto-updates on payment
8. ✅ Payment amount must be positive
9. ✅ Soft delete with status recalculation

## 📝 Notes

- Uses TypeORM with `synchronize: true` in development
- For production, generate and run migrations
- JWT token expires in 24 hours
- All timestamps in ISO 8601 format
- Decimal precision: 15 digits, 2 decimal places

## 🤝 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for QistonPe**
