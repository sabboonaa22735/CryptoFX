const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');

router.post('/', auth, async (req, res) => {
  try {
    const { subject, category, priority, message, attachments } = req.body;

    const ticket = new Ticket({
      user: req.user.id,
      subject,
      description: message,
      category,
      priority,
      messages: [{
        sender: req.user.id,
        message,
        attachments
      }],
      status: 'open'
    });

    await ticket.save();
    res.status(201).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const query = { user: req.user.id };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/message', auth, async (req, res) => {
  try {
    const { message, attachments } = req.body;

    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.messages.push({
      sender: req.user.id,
      message,
      attachments,
      isAdmin: false
    });

    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }

    await ticket.save();
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/close', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = 'closed';
    await ticket.save();
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, priority, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    const stats = await Ticket.aggregate([
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/assign', adminAuth, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('user', 'name email');
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/admin-reply', adminAuth, async (req, res) => {
  try {
    const { message, attachments } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.messages.push({
      sender: req.user.id,
      message,
      attachments,
      isAdmin: true
    });

    ticket.status = 'in_progress';
    await ticket.save();
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/priority', adminAuth, async (req, res) => {
  try {
    const { priority } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
