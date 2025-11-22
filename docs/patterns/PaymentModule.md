# Payment Module

## Overview
The Payment Module handles all payment-related functionality for the application, including integration with Razorpay as the payment gateway. This module manages payment processing, transactions, and invoice generation.

## Folder Structure
```
PaymentModule/
├── entities/
│   ├── payment.entity.ts
│   ├── payment-transaction.entity.ts
│   └── payment-invoice.entity.ts
├── constants/
│   ├── payment-status.enum.ts
│   └── payment-types.enum.ts
├── interfaces/
│   ├── payment-provider.interface.ts
│   └── razorpay-response.interface.ts
├── payments/
│   ├── dto/
│   │   ├── create-payment.dto.ts
│   │   ├── payment-response.dto.ts
│   │   └── payment-query.dto.ts
│   ├── services/
│   │   ├── payment.service.ts
│   │   ├── razorpay.service.ts
│   │   └── payment-invoice.service.ts
│   └── payment.controller.ts
├── payment-transactions/
│   ├── dto/
│   │   ├── transaction-query.dto.ts
│   │   └── transaction-response.dto.ts
│   ├── services/
│   │   └── payment-transaction.service.ts
│   └── payment-transaction.controller.ts
└── webhook/
    ├── dto/
    │   ├── webhook-event.dto.ts
    │   └── webhook-response.dto.ts
    ├── services/
    │   └── webhook-handler.service.ts
    └── webhook.controller.ts
```

## API Endpoints

### Payment Controller
```
// Create payment order
POST /api/payments

// Get payment details
GET /api/payments/:id

// Get payment status
GET /api/payments/:id/status

// Process payment callback
POST /api/payments/callback

// Download invoice
GET /api/payments/:id/invoice

// Generate invoice
POST /api/payments/:id/invoice
```

### Payment Transaction Controller
```
// Get payment transactions
GET /api/payment-transactions

// Get payment transaction by ID
GET /api/payment-transactions/:id

// Get transactions for a specific payment
GET /api/payment-transactions/payment/:paymentId
```

### Webhook Controller
```
// Razorpay webhook handler
POST /api/payments/webhooks
```

## Key Components

### Entities

#### Payment Entity
Stores the main payment information:
- Payment details (amount, currency)
- Razorpay order and payment IDs
- Status tracking
- Metadata

#### Payment Transaction Entity
Tracks all state changes for a payment:
- Status changes
- Response data from Razorpay
- Error messages (if any)

#### Payment Invoice Entity
Manages invoice information:
- Invoice number and date
- File storage path
- Generation status

### Services

#### Payment Service
Core business logic for payments:
- Creating payment orders
- Processing payment callbacks
- Checking payment status
- Payment validation

#### Razorpay Service
Handles direct integration with Razorpay API:
- Order creation
- Payment verification
- Payment capture
- Refund processing

#### Payment Transaction Service
Manages the transaction history:
- Recording status changes
- Tracking payment flow

#### Payment Invoice Service
Handles invoice generation and retrieval:
- Creating invoice PDFs
- Storing invoice data
- Providing invoice download

#### Webhook Handler Service
Processes incoming webhooks from Razorpay:
- Validating webhook authenticity
- Updating payment status
- Triggering related actions

## Integration with Other Modules

### Subscription Module Integration
- Payments linked to subscription plans
- Automatic renewal payments
- Pro-rated payment calculations

### User Module Integration
- User-based payment history
- Payment method management
- User billing information

## Configuration

### Environment Variables
```
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Testing Strategy

### Unit Tests
- Service layer functionality
- Payment calculation logic
- Webhook processing

### Integration Tests
- API endpoint functionality
- Razorpay API integration
- Database operations

### Mock Tests
- Simulated payment flows
- Error handling scenarios
```