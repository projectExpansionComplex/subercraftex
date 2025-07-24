const express = require('express');
const router = express.Router();
const Consultation = require('../models/craftexconsultationModel');
const craftexDesigner = require('../models/craftexDesigner');
const { body, validationResult } = require('express-validator');

// POST route to book a consultation
router.post(
  '/api/consultations',
  [
    body('designerUid').notEmpty().withMessage('Designer ID is required'),
    body('slotId').notEmpty().withMessage('Slot ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { designerUid, slotId } = req.body;

      // Find the designer
      const designer = await craftexDesigner.findById(designerUid);
      if (!designer) {
        return res.status(404).json({ message: 'Designer not found' });
      }

      // Find the slot
      const slot = designer.consultationSlots.id(slotId);
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }

      // Mark the slot as booked
      slot.isBooked = true;
      await designer.save();

      res.status(201).json({ message: 'Consultation booked successfully', slot });
    } catch (err) {
      console.error('Error booking consultation:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch consultations for a user or designer
router.get('/api/consultations', async (req, res) => {
  try {
    const { userId, designerId } = req.query;

    let consultations;
    if (userId) {
      consultations = await Consultation.find({ user: userId }).populate('designer', 'name avatar');
    } else if (designerId) {
      consultations = await Consultation.find({ designer: designerId }).populate('user', 'name email');
    } else {
      return res.status(400).json({ message: 'User ID or Designer ID is required' });
    }

    res.status(200).json(consultations);
  } catch (err) {
    console.error('Error fetching consultations:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;