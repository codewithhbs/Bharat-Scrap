const Contact = require('../models/contact.model');

// Create a new contact message
async function createContactMessage(req, res) {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const contact = new Contact({ name, email, phone, message, isQuote: false });
    await contact.save();
    res.status(201).json({ message: 'Contact message created successfully' });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: 'Failed to create contact message' });
  }
};

async function createQuoteRequest(req, res) {
  try {
    console.log("Creating quote request with data:", req.body);
    const { name, email, phone, brand, model, year, fuelType, city } = req.body;
    if (!name || !email || !phone || !brand || !model || !year || !fuelType || !city) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const contact = new Contact({ name, email, phone, brand, model, year, fuelType, city, isQuote: true });
    await contact.save();
    res.status(201).json({ message: 'Quote request created successfully' });
  } catch (error) {
    console.error('Error creating quote request:', error);
    res.status(500).json({ error: 'Failed to create quote request' });
  }
};

module.exports = {
  createContactMessage,
  createQuoteRequest,
};