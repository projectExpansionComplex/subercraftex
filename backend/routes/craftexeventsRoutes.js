const express = require('express');
const craftexEvent = require( '../models/craftexEvent');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCustomRequest = require('../models/craftexCustomRequest')
const path = require('path')
const sharp = require('sharp');

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'products')); // Save files in 'uploads/products'
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
      cb(null, uniqueSuffix + '-' + sanitizedFilename); // Unique filename
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept only image files
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


// POST route to create a new event
router.post(
  '/api/craftexevents',
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location').notEmpty().withMessage('Location is required'),
    body('organizer').notEmpty().withMessage('Organizer ID is required'),
    body('attendees').optional().isArray().withMessage('Attendees must be an array of user IDs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, date, location, organizer, attendees } = req.body;

      // Validate organizer
      const existingOrganizer = await craftexUser.findById(organizer);
      if (!existingOrganizer) {
        return res.status(400).json({ message: 'Invalid organizer ID' });
      }

      // Validate attendees (if provided)
      if (attendees) {
        for (const attendee of attendees) {
          const existingAttendee = await craftexUser.findById(attendee);
          if (!existingAttendee) {
            return res.status(400).json({ message: `Invalid attendee ID: ${attendee}` });
          }
        }
      }

      // Create new event
      const event = new craftexEvent({
        title,
        description,
        date,
        location,
        organizer,
        attendees: attendees || [], // Initialize attendees as an empty array if not provided
      });

      // Save event to the database
      const savedEvent = await event.save();

      // Return the saved event
      res.status(201).json(savedEvent);
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all events
router.get('/api/craftexevents', async (req, res) => {
  try {
    const events = await craftexEvent.find()
      .populate('organizer', 'name email') // Populate organizer details
      .populate('attendees', 'name email'); // Populate attendee details
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single event by ID
router.get('/api/craftexevents/:id', async (req, res) => {
  try {
    const event = await craftexEvent.findById(req.params.id)
      .populate('organizer', 'name email') // Populate organizer details
      .populate('attendees', 'name email'); // Populate attendee details
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an event by ID
router.put(
  '/api/craftexevents/:id',
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('attendees').optional().isArray().withMessage('Attendees must be an array of user IDs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, date, location, attendees } = req.body;

      // Find the event by ID
      const event = await craftexEvent.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Update fields if provided
      if (title) event.title = title;
      if (description) event.description = description;
      if (date) event.date = date;
      if (location) event.location = location;
      if (attendees) {
        // Validate attendees
        for (const attendee of attendees) {
          const existingAttendee = await craftexUser.findById(attendee);
          if (!existingAttendee) {
            return res.status(400).json({ message: `Invalid attendee ID: ${attendee}` });
          }
        }
        event.attendees = attendees;
      }

      // Save updated event
      const updatedEvent = await event.save();

      // Return the updated event
      res.status(200).json(updatedEvent);
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete an event by ID
router.delete('/api/craftexevents/:id', async (req, res) => {
  try {
    const event = await craftexEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to add an attendee to an event
router.post(
  '/api/craftexevents/:id/attendees',
  [
    // Validation middleware using express-validator
    body('attendee').notEmpty().withMessage('Attendee ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { attendee } = req.body;

      // Validate attendee
      const existingAttendee = await craftexUser.findById(attendee);
      if (!existingAttendee) {
        return res.status(400).json({ message: 'Invalid attendee ID' });
      }

      // Find the event by ID
      const event = await craftexEvent.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if the attendee is already registered
      if (event.attendees.includes(attendee)) {
        return res.status(400).json({ message: 'Attendee is already registered for this event' });
      }

      // Add the attendee
      event.attendees.push(attendee);

      // Save updated event
      const updatedEvent = await event.save();

      // Return the updated event
      res.status(201).json(updatedEvent);
    } catch (err) {
      console.error('Error adding attendee:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);




module.exports = router