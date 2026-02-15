# Checkout & Payment System - Testing Guide

## Quick Start Testing

### Prerequisites
- Frontend running on `http://localhost:3000`
- Backend running on `http://localhost:5000`
- User logged in with valid credentials

### Test Account Credentials (Use existing accounts)
```
Email: test@example.com / user@example.com
Password: password123 / user@123
```

---

## Test Cases

### TEST SUITE 1: PRODUCT TO CART FLOW

#### TC-1.1: Add Single Item to Cart
**Steps:**
1. Navigate to home page
2. Click on any product card
3. Enter quantity (e.g., 1)
4. Click "Add to Cart" button

**Expected Result:**
- ✓ Success message appears
- ✓ Cart count increases in navbar
- ✓ User redirected to cart page

**Status**: [PASS/FAIL]

---

#### TC-1.2: Add Multiple Items to Cart
**Steps:**
1. Add product 1 (qty: 2)
2. Add product 2 (qty: 1)
3. Add product 3 (qty: 3)

**Expected Result:**
- ✓ All items appear in cart
- ✓ Cart count shows total items
- ✓ Prices calculated correctly

**Status**: [PASS/FAIL]

---

### TEST SUITE 2: CART PAGE FUNCTIONALITY

#### TC-2.1: View Cart Items
**Steps:**
1. Click cart icon or navigate to /cart
2. View all items in cart

**Expected Result:**
- ✓ All added items display
- ✓ Item names visible
- ✓ Item prices visible
- ✓ Item quantities visible

**Status**: [PASS/FAIL]

---

#### TC-2.2: Update Item Quantity
**Steps:**
1. Increase item quantity using + button
2. Decrease item quantity using - button
3. Edit quantity in input field

**Expected Result:**
- ✓ Quantity updates immediately
- ✓ Total price updates
- ✓ Cart total recalculates

**Status**: [PASS/FAIL]

---

#### TC-2.3: Remove Item from Cart
**Steps:**
1. Click "Remove" button on any item
2. Confirm item is removed

**Expected Result:**
- ✓ Item removed from cart
- ✓ Cart total updates
- ✓ Cart count decreases

**Status**: [PASS/FAIL]

---

#### TC-2.4: Clear Entire Cart
**Steps:**
1. Click "Clear Cart" button
2. Confirm cart is empty

**Expected Result:**
- ✓ All items removed
- ✓ Empty cart message displays
- ✓ Cart count shows 0

**Status**: [PASS/FAIL]

---

#### TC-2.5: Proceed to Checkout (Logged In)
**Steps:**
1. Add items to cart
2. Click "Proceed to Checkout" button

**Expected Result:**
- ✓ User navigated to /checkout
- ✓ Checkout page loads
- ✓ Cart items display in summary

**Status**: [PASS/FAIL]

---

#### TC-2.6: Proceed to Checkout (Not Logged In)
**Steps:**
1. Logout user
2. Add items to cart
3. Click "Proceed to Checkout" button

**Expected Result:**
- ✓ Alert message: "Please login to proceed"
- ✓ User redirected to /auth page
- ✓ Login form displays

**Status**: [PASS/FAIL]

---

### TEST SUITE 3: CHECKOUT PAGE - FORM VALIDATION

#### TC-3.1: Empty Address Field
**Steps:**
1. Navigate to checkout
2. Leave "delivery address" empty
3. Click "Place Order"

**Expected Result:**
- ✓ Alert: "Please fill in all delivery details"
- ✓ Form not submitted
- ✓ User stays on checkout page

**Status**: [PASS/FAIL]

---

#### TC-3.2: Empty Phone Field
**Steps:**
1. Navigate to checkout
2. Fill delivery address
3. Leave phone number empty
4. Click "Place Order"

**Expected Result:**
- ✓ Alert: "Please fill in all delivery details"
- ✓ Form not submitted
- ✓ User stays on checkout page

**Status**: [PASS/FAIL]

---

#### TC-3.3: Both Fields Filled
**Steps:**
1. Navigate to checkout
2. Fill delivery address
3. Fill phone number
4. Verify "Place Order" button is enabled

**Expected Result:**
- ✓ Both fields have values
- ✓ "Place Order" button is enabled
- ✓ No validation errors

**Status**: [PASS/FAIL]

---

### TEST SUITE 4: CHECKOUT PAGE - ORDER SUMMARY

#### TC-4.1: Subtotal Calculation
**Steps:**
1. Add items with known prices
2. Go to checkout
3. Verify subtotal matches (item price × quantity)

**Expected Result:**
- ✓ Subtotal = Sum(price × quantity)
- ✓ Correct currency (₹)
- ✓ Accurate to 2 decimal places

**Test Case:**
```
Item 1: ₹1,000 × 2 = ₹2,000
Item 2: ₹500 × 1 = ₹500
Subtotal = ₹2,500 ✓
```

**Status**: [PASS/FAIL]

---

#### TC-4.2: Free Delivery (> ₹500)
**Steps:**
1. Add items totaling > ₹500
2. Go to checkout
3. Verify delivery charge

**Expected Result:**
- ✓ Delivery Charge = ₹0 (FREE)
- ✓ Text shows "Free Delivery (Orders > ₹500)"
- ✓ Total = Subtotal + 0

**Status**: [PASS/FAIL]

---

#### TC-4.3: Express Delivery Charge (≤ ₹500)
**Steps:**
1. Add items totaling ≤ ₹500
2. Select Standard delivery
3. Go to checkout

**Expected Result:**
- ✓ Standard Delivery = ₹0
- ✓ Total = Subtotal + 0

**Status**: [PASS/FAIL]

---

#### TC-4.4: Express Delivery Surcharge
**Steps:**
1. Add items any total
2. Select "Express Delivery" option
3. Verify total

**Expected Result:**
- ✓ Express Delivery = ₹99 (always added if Express selected)
- ✓ Total = Subtotal + 99
- ✓ "⚡ Express Delivery (1-2 days) - ₹99" displays

**Status**: [PASS/FAIL]

---

### TEST SUITE 5: CHECKOUT PAGE - DELIVERY OPTIONS

#### TC-5.1: Standard Delivery Selection
**Steps:**
1. Navigate to checkout
2. Click on "Standard Delivery" radio button

**Expected Result:**
- ✓ Radio button selected
- ✓ "📦 Standard Delivery (3-5 days) - FREE" text visible
- ✓ No extra charge added

**Status**: [PASS/FAIL]

---

#### TC-5.2: Express Delivery Selection
**Steps:**
1. Navigate to checkout
2. Click on "Express Delivery" radio button

**Expected Result:**
- ✓ Radio button selected
- ✓ "⚡ Express Delivery (1-2 days) - ₹99" text visible
- ✓ ₹99 added to total

**Status**: [PASS/FAIL]

---

### TEST SUITE 6: CHECKOUT PAGE - PAYMENT METHODS

#### TC-6.1: Cash on Delivery (Default)
**Steps:**
1. Navigate to checkout
2. Verify COD is pre-selected
3. Check message displayed

**Expected Result:**
- ✓ "💵 Cash on Delivery (Pay at doorstep)" selected
- ✓ No additional message shown
- ✓ Default payment method

**Status**: [PASS/FAIL]

---

#### TC-6.2: Scheduled Payment Selection
**Steps:**
1. Navigate to checkout
2. Click on "Scheduled Payment" radio button

**Expected Result:**
- ✓ Radio button selected
- ✓ "📅 Scheduled Payment (Pay later)" text visible
- ✓ Information box appears with message:
  - "🔔 You will receive a payment link via email/SMS before delivery."
  - "Payment due within 48 hours of delivery."

**Status**: [PASS/FAIL]

---

#### TC-6.3: Switch Between Payment Methods
**Steps:**
1. Select COD
2. Verify no message shown
3. Select Scheduled Payment
4. Verify message shown
5. Switch back to COD
6. Verify message disappears

**Expected Result:**
- ✓ Messages appear/disappear correctly
- ✓ Smooth transition
- ✓ No console errors

**Status**: [PASS/FAIL]

---

### TEST SUITE 7: ORDER PLACEMENT

#### TC-7.1: Place Order - Cash on Delivery
**Steps:**
1. Navigate to checkout
2. Fill delivery address: "123 Main St, Bangalore"
3. Fill phone number: "9876543210"
4. Select "Standard Delivery"
5. Select "Cash on Delivery" (default)
6. Click "Place Order"

**Expected Result:**
- ✓ Form validates successfully
- ✓ "Processing..." appears on button
- ✓ Page navigates to /order-confirmation
- ✓ Cart is cleared

**Status**: [PASS/FAIL]

---

#### TC-7.2: Place Order - Scheduled Payment
**Steps:**
1. Navigate to checkout
2. Fill delivery address: "456 Park Ave, Mumbai"
3. Fill phone number: "9988776655"
4. Select "Express Delivery"
5. Select "Scheduled Payment"
6. Click "Place Order"

**Expected Result:**
- ✓ Form validates successfully
- ✓ Page navigates to /order-confirmation
- ✓ Cart is cleared
- ✓ Scheduled payment details retained

**Status**: [PASS/FAIL]

---

### TEST SUITE 8: ORDER CONFIRMATION PAGE

#### TC-8.1: Confirmation Header
**Steps:**
1. Place an order successfully
2. Land on order confirmation page

**Expected Result:**
- ✓ Green checkmark (✓) visible
- ✓ "Order Placed Successfully!" heading
- ✓ Order ID displayed (format: #ABC123XYZ)
- ✓ Checkmark animation plays

**Status**: [PASS/FAIL]

---

#### TC-8.2: Order Details Display (COD)
**Steps:**
1. Place order with COD
2. Check order details section

**Expected Result:**
- ✓ Delivery Address: Shows entered address
- ✓ Phone Number: Shows entered number
- ✓ Delivery Type: Shows "📦 Standard Delivery (3-5 days)" or "⚡ Express (1-2 days)"
- ✓ Payment Method: Shows "💵 Cash on Delivery"
- ✓ Estimated Delivery: Shows correct date (3-5 days from today)

**Status**: [PASS/FAIL]

---

#### TC-8.3: Order Details Display (Scheduled)
**Steps:**
1. Place order with Scheduled Payment
2. Check order details section

**Expected Result:**
- ✓ Payment Method: Shows "📅 Scheduled Payment"
- ✓ Estimated Delivery: Shows correct date
- ✓ All other details match order

**Status**: [PASS/FAIL]

---

#### TC-8.4: Items Ordered List
**Steps:**
1. Place order with 3 items
2. Check "Items Ordered" section

**Expected Result:**
- ✓ All 3 items listed
- ✓ Item names visible
- ✓ Individual prices shown (₹)
- ✓ Total amount displayed at bottom

**Status**: [PASS/FAIL]

---

#### TC-8.5: Total Amount Display
**Steps:**
1. Place order
2. Check total amount on confirmation

**Expected Result:**
- ✓ Total matches checkout page total
- ✓ Includes all calculations (subtotal + delivery)
- ✓ Formatted in ₹ (INR)
- ✓ Bold/highlighted display

**Status**: [PASS/FAIL]

---

#### TC-8.6: Payment Instructions (COD)
**Steps:**
1. Place order with COD
2. Check payment information box

**Expected Result:**
- ✓ "💰 Cash on Delivery" section visible
- ✓ Instructions: "Please have the exact amount ready at the time of delivery."
- ✓ Additional: "Our delivery partner will collect the payment."
- ✓ Blue highlighted box

**Status**: [PASS/FAIL]

---

#### TC-8.7: Payment Instructions (Scheduled)
**Steps:**
1. Place order with Scheduled Payment
2. Check payment information box

**Expected Result:**
- ✓ "📧 Payment Instructions" section visible
- ✓ Message 1: "You will receive a payment link via email/SMS before delivery."
- ✓ Message 2: "Payment due within 48 hours of delivery."
- ✓ Blue highlighted box

**Status**: [PASS/FAIL]

---

#### TC-8.8: Continue Shopping Button
**Steps:**
1. Land on confirmation page
2. Click "Continue Shopping" button

**Expected Result:**
- ✓ User navigated to home page (/)
- ✓ Page loads successfully
- ✓ Carousel displays

**Status**: [PASS/FAIL]

---

#### TC-8.9: Track Order Button
**Steps:**
1. Land on confirmation page
2. Click "Track Order" button

**Expected Result:**
- ✓ Button is clickable
- ✓ Placeholder page or future functionality
- ✓ No errors in console

**Status**: [PASS/FAIL]

---

#### TC-8.10: Confirmation Footer
**Steps:**
1. Land on confirmation page
2. Scroll to bottom

**Expected Result:**
- ✓ Message: "A confirmation email has been sent to user@email.com"
- ✓ Support info: "Need help? Contact us at support@sunelectronics.com..."
- ✓ Light background footer styling

**Status**: [PASS/FAIL]

---

### TEST SUITE 9: ESTIMATED DELIVERY DATE

#### TC-9.1: Standard Delivery Date Calculation
**Steps:**
1. Place order on Dec 15, 2024 with Standard delivery
2. Check estimated delivery date

**Expected Result:**
- ✓ Date = Dec 15 + 5 days = Dec 20, 2024
- ✓ Format: "Fri Dec 20 2024" or similar
- ✓ Correct calculation

**Status**: [PASS/FAIL]

---

#### TC-9.2: Express Delivery Date Calculation
**Steps:**
1. Place order on Dec 15, 2024 with Express delivery
2. Check estimated delivery date

**Expected Result:**
- ✓ Date = Dec 15 + 2 days = Dec 17, 2024
- ✓ Format: "Wed Dec 17 2024" or similar
- ✓ Correct calculation

**Status**: [PASS/FAIL]

---

### TEST SUITE 10: RESPONSIVE DESIGN

#### TC-10.1: Desktop View (> 1024px)
**Steps:**
1. Open checkout on desktop
2. Verify layout

**Expected Result:**
- ✓ Form fields full width
- ✓ Radio buttons in column layout
- ✓ Buttons side by side
- ✓ No overflow

**Status**: [PASS/FAIL]

---

#### TC-10.2: Tablet View (768px - 1024px)
**Steps:**
1. Open checkout on tablet resolution
2. Verify responsive layout

**Expected Result:**
- ✓ Content readable
- ✓ Form fields adjusted
- ✓ No horizontal scroll
- ✓ Touch-friendly buttons

**Status**: [PASS/FAIL]

---

#### TC-10.3: Mobile View (< 768px)
**Steps:**
1. Open checkout on mobile (iPhone/Android)
2. Verify responsive layout

**Expected Result:**
- ✓ Single column layout
- ✓ Full-width form fields
- ✓ Full-width buttons
- ✓ Readable text
- ✓ No horizontal scroll
- ✓ Touch-friendly elements (min 44px height)

**Status**: [PASS/FAIL]

---

#### TC-10.4: Confirmation Page Mobile
**Steps:**
1. Complete order on mobile
2. Land on confirmation page

**Expected Result:**
- ✓ Checkmark visible and centered
- ✓ All text readable
- ✓ Buttons full width
- ✓ No overflow
- ✓ Footer content wrapped properly

**Status**: [PASS/FAIL]

---

### TEST SUITE 11: ERROR HANDLING

#### TC-11.1: Network Error Simulation
**Steps:**
1. Disconnect internet (or mock API error)
2. Try to place order

**Expected Result:**
- ✓ Error message displays
- ✓ User remains on checkout page
- ✓ Can retry order

**Status**: [PASS/FAIL]

---

#### TC-11.2: Missing Auth Token
**Steps:**
1. Clear localStorage (remove auth token)
2. Try to access checkout

**Expected Result:**
- ✓ User redirected to /auth
- ✓ Login required message
- ✓ Clean redirect, no errors

**Status**: [PASS/FAIL]

---

### TEST SUITE 12: EDGE CASES

#### TC-12.1: Very Long Address
**Steps:**
1. Enter 200+ character address
2. Place order

**Expected Result:**
- ✓ Text wraps properly
- ✓ Displayed correctly on confirmation
- ✓ No layout breaks

**Status**: [PASS/FAIL]

---

#### TC-12.2: Special Characters in Phone
**Steps:**
1. Enter phone with spaces/dashes: "+91 9876-54321"
2. Place order

**Expected Result:**
- ✓ Phone accepted
- ✓ Displayed as entered
- ✓ No validation error

**Status**: [PASS/FAIL]

---

#### TC-12.3: Max/Min Quantity Items
**Steps:**
1. Add item with qty: 999
2. Add item with qty: 1
3. Place order

**Expected Result:**
- ✓ Both quantities accepted
- ✓ Total calculated correctly
- ✓ No errors

**Status**: [PASS/FAIL]

---

#### TC-12.4: Large Order Amount (> ₹100,000)
**Steps:**
1. Add expensive items totaling > ₹100,000
2. Go to checkout
3. Place order

**Expected Result:**
- ✓ Amount displays correctly
- ✓ No formatting issues
- ✓ Calculation accurate

**Status**: [PASS/FAIL]

---

## Browser Compatibility Testing

### Browsers to Test
- [ ] Chrome/Chromium (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### For Each Browser:
- [ ] Form input works smoothly
- [ ] Animations play correctly
- [ ] Buttons clickable
- [ ] Navigation works
- [ ] Layout responsive
- [ ] No console errors

---

## Performance Testing

### Metrics to Check
```
Checkout Page Load Time:      < 1 second
Form Input Response:           Instant (< 50ms)
Place Order Button Response:   < 1 second
Confirmation Page Load:        < 500ms
Navigation Between Pages:      < 300ms
Animation Smoothness:          60 FPS
```

---

## Test Summary Template

```
TEST EXECUTION SUMMARY
═════════════════════════════════════════════════════════════════════════════

Test Suite:           Checkout & Payment System
Test Date:            [DATE]
Tested By:            [NAME]
Environment:          Production / Staging / Local
Browser/Device:       [BROWSER/DEVICE]

RESULTS OVERVIEW:
────────────────────────────────────────────────────────────────────────────
✓ PASS:               [NUMBER]
✗ FAIL:               [NUMBER]
⊘ BLOCKED:            [NUMBER]
△ SKIPPED:            [NUMBER]
─────────────────────────────────────────────────────────────────────────────
TOTAL:                [NUMBER]

Success Rate:         [PERCENTAGE]%
Severity Level:       [CRITICAL/HIGH/MEDIUM/LOW]

CRITICAL ISSUES:
────────────────────────────────────────────────────────────────────────────
1. [Issue description]
2. [Issue description]

RECOMMENDATIONS:
────────────────────────────────────────────────────────────────────────────
1. [Recommendation]
2. [Recommendation]

SIGN-OFF:
────────────────────────────────────────────────────────────────────────────
Tested By:            ________________     Date: ________
Approved By:          ________________     Date: ________
```

---

## Quick Smoke Test Checklist

**Run this before deploying:**

- [ ] Product can be added to cart
- [ ] Cart page displays items
- [ ] Can navigate to checkout
- [ ] All form fields accept input
- [ ] Place order button works
- [ ] Order confirmation page displays
- [ ] Correct total amount shown
- [ ] Payment method option works
- [ ] Delivery type option works
- [ ] Continue shopping button works
- [ ] No console errors
- [ ] Mobile view responsive
- [ ] All links navigating correctly

---

**Last Updated**: December 2024
**Test Coverage**: 75+ test cases
**Status**: Ready for Testing
