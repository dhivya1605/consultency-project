const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter using environment variables
// Note: For Gmail, you need an "App Password" if 2FA is enabled.
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a professional HTML email for order status updates
 * @param {Object} order - The order object
 * @param {Object} user - User object with email and name
 */
const sendOrderStatusEmail = async (order, user) => {

  const orderID = order._id.toString().slice(-6).toUpperCase();
  const status = order.orderStatus;
  const productNames = order.items?.map(item => item.productName || item.name).join(', ') || 'your items';
  
  // If credentials aren't provided, log to console instead of failing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n--- SIMULATED EMAIL LOG ---');
    console.log(`From: store@example.com`);
    console.log(`To: ${user.email}`);
    console.log(`Subject: Update for Order #${orderID}`);
    console.log(`Content: The ${productNames} you ordered is ${status.toLowerCase()}`);
    console.log('---------------------------\n');
    return;
  }

  let statusMessage = '';
  let statusColor = '#3498db';

  switch (status) {
    case 'Packed':
      statusMessage = `The <b>${productNames}</b> you ordered has been packed and is ready for shipment.`;
      statusColor = '#9b59b6';
      break;
    case 'Shipped':
      statusMessage = `Great news! The <b>${productNames}</b> you ordered is on its way.`;
      statusColor = '#e67e22';
      break;
    case 'Out for Delivery':
      statusMessage = `The <b>${productNames}</b> you ordered is nearby and will reach you today!`;
      statusColor = '#f39c12';
      break;
    case 'Delivered':
      statusMessage = `The <b>${productNames}</b> you ordered has been successfully delivered. We hope you love it!`;
      statusColor = '#27ae60';
      break;
    case 'Cancelled':
      statusMessage = `The order for <b>${productNames}</b> has been cancelled.`;
      statusColor = '#e74c3c';
      break;
    default:
      statusMessage = `The status for <b>${productNames}</b> has been updated to ${status}.`;
  }

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #1a3a52; text-align: center;">Order Update</h2>
      <p>Hi ${user.name || 'Valued Customer'},</p>
      <p>${statusMessage}</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> #${orderID}</p>
        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
      </div>

      <p>You can track your order status in your profile on our store.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message. Please do not reply.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Store Notifications" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Update for Order #${orderID}: ${status}`,
      html: htmlContent
    });
    console.log(`Email sent to ${user.email} for status ${status}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendOrderStatusEmail };
