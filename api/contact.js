import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

let Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default async function handler(req, res) {
  // Handle GET requests
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'GET method is active!' });
  }

  // Handle POST requests
  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      await connectToDatabase();
      const contact = new Contact({ name, email, message });
      await contact.save();
      return res.status(200).json({ message: 'Form submission saved to database!' });
    } catch (error) {
      console.error('Error saving to database:', error);
      return res.status(500).json({ error: 'Failed to save to database' });
    }
  }

  // Default to 405 for unsupported methods
  return res.status(405).json({ error: 'Method Not Allowed' });
}
