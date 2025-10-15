const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Get all contact messages (admin only)
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all contacts...');
        const messages = await Contact.find().sort({ createdAt: -1 });
        console.log('Found contacts:', messages.length);
        res.json(messages);
    } catch (error) {
        console.error('Contact fetch error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new contact message
router.post('/', async (req, res) => {
    try {
        console.log('Received contact data:', req.body);
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const contact = new Contact({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'new',
            ipAddress: req.ip || 'unknown'
        });
        
        console.log('Saving contact:', contact);
        const savedContact = await contact.save();
        console.log('Contact saved:', savedContact);
        
        res.status(201).json({ 
            message: 'Message sent successfully!',
            id: savedContact._id,
            data: savedContact
        });
    } catch (error) {
        console.error('Contact save error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update message status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        res.json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete message
router.delete('/:id', async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;