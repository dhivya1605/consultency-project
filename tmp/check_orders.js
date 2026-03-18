const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const OrderSchema = new mongoose.Schema({
  orderDate: { type: Date, default: Date.now },
  totalAmount: Number
});

const Order = mongoose.model('Order', OrderSchema);

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const orders = await Order.find();
    console.log(`Total orders found: ${orders.length}`);

    const monthlyCounts = {};
    orders.forEach(order => {
      const month = order.orderDate.toISOString().substring(0, 7); // YYYY-MM
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    console.log('Orders per month:');
    console.log(JSON.stringify(monthlyCounts, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkOrders();
