import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { users, invoices, customers, revenue } from '../lib/placeholder-data';

// Define MongoDB Models (Schemas)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const invoiceSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  date: { type: Date, required: true },
});

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  image_url: { type: String, required: true },
});

const revenueSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  revenue: { type: Number, required: true },
});

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
const Revenue = mongoose.models.Revenue || mongoose.model('Revenue', revenueSchema);

// MongoDB connection utility
const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Seed Users
async function seedUsers() {
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({
        name: user.name,
        email: user.email,
        password: hashedPassword,
      });
      await newUser.save();
    })
  );
  return insertedUsers;
}

// Seed Invoices
async function seedInvoices() {
  const insertedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      const newInvoice = new Invoice({
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.date,
      });
      await newInvoice.save();
    })
  );
  return insertedInvoices;
}

// Seed Customers
async function seedCustomers() {
  const insertedCustomers = await Promise.all(
    customers.map(async (customer) => {
      const newCustomer = new Customer({
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      });
      await newCustomer.save();
    })
  );
  return insertedCustomers;
}

// Seed Revenue
async function seedRevenue() {
  const insertedRevenue = await Promise.all(
    revenue.map(async (rev) => {
      const newRevenue = new Revenue({
        month: rev.month,
        revenue: rev.revenue,
      });
      await newRevenue.save();
    })
  );
  return insertedRevenue;
}

// API Route for Seeding Data
export async function GET() {
  try {
    await connectToDatabase(); // Connect to MongoDB

    // Seed Data
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return Response.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
