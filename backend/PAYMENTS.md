# PayU test payments:

Digital Heroes uses PayU Hosted Checkout for the first paid subscription transaction. The backend creates an inactive subscription and a pending `payments` record before redirecting to PayU. The subscription becomes active and its charity contribution is created only after a valid PayU response hash and server-side `verify_payment` confirmation.

## Setup:

1. Run `database/001_payments.sql` in the Supabase SQL editor. Do not run it against production without reviewing the existing schema first.
2. Copy the variable names from `.env.example` into the backend environment and provide PayU test values from the PayU dashboard. Never put the merchant salt in the frontend environment.
3. Set these callback URLs to public HTTPS backend URLs:
   - `PAYU_SUCCESS_URL`: `/api/payments/payu/success`
   - `PAYU_FAILURE_URL`: `/api/payments/payu/failure`
   - `PAYU_CANCEL_URL`: `/api/payments/payu/cancel`
   - `PAYU_WEBHOOK_URL`: `/api/payments/payu/webhook`
4. Keep the test endpoints:
   - `PAYU_PAYMENT_URL`: `https://test.payu.in/_payment`
   - `PAYU_VERIFY_URL`: `https://test.payu.in/merchant/postservice.php?form=2`

The payment flow uses INR explicitly for PayU test payments. No currency conversion is performed.

## Test flow:

- Sign in and submit a subscription with a real checkout phone number.
- Use PayU Hosted Checkout test credentials. The official test card `5123456789012346`, expiry `05/30`, CVV `123`, OTP `123456` exercises success.
- `5123456789012340` exercises a failed card flow. PayU also documents `anything@payu` and `999999999@payu` for test UPI.
- The browser return is only a user-facing result. The backend validates the reverse hash and calls Verify Payment.
- A failed or cancelled payment remains non-active and creates no subscription donation. The user can retry from the subscription page.

## Security:

The salt stays backend-only. The backend validates response hash, merchant key, transaction ID, and amount, then treats PayU verification and the webhook as the payment authority. Callback and webhook processing are idempotent; repeated notifications do not create a second subscription contribution.

This implementation covers the initial paid transaction. PayU recurring mandates, pre-debit notifications, and recurring debit APIs require separate PayU subscription enablement and are not enabled by this initial checkout flow.
