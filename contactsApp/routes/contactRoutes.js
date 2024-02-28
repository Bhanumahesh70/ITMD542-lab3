const express = require("express");
const router = express.Router();
const DataService = require('./dataService');

const sanitizeHtml = require("sanitize-html");
const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'escape',
  disallowedTags: ['script', 'style'],
  allowedAttributes: {}, // No attributes allowed
  allowedClasses: {} // No classes allowed
};

// Initialize data service
const dataService = new DataService('./data/contacts.db');

// GET all contacts
router.get("/contacts", function (req, res, next) {
  dataService.getAllContacts((err, contacts) => {
    if (err) {
      return next(err);
    }
    res.render("contact/display_all_contacts", { contacts });
  });
});

// GET create new contact form method
router.get("/contacts/create", function (req, res, next) {
  const emptyContact = {}; // Create an empty contact object
  res.render("contact/create_contact", { contact: emptyContact }); // Pass the empty contact object to the template
});

// GET contact by ID
router.get("/contacts/:id", function (req, res, next) {
  dataService.getContactById(req.params.id, (err, contact) => {
    if (err) {
      return next(err);
    }
    if (!contact) {
      // Handle case when contact is not found
      return res.render("contact/deleted_contact");
    }
    res.render("contact/show_contact", { contact });
  });
});

// GET edit contact form
router.get('/contacts/:id/edit', function(req, res, next) {
  dataService.getContactById(req.params.id, (err, contact) => {
    if (err) {
      return next(err);
    }
    res.render('contact/edit_contact', { contact });
  });
});

// POST create contact
router.post("/contacts", function (req, res, next) {
  // Validation
  const { firstName, lastName, emailAddress, notes } = req.body || {}; // Using optional chaining to avoid accessing properties of undefined
  if (!firstName?.trim() || !lastName?.trim()) { // Using optional chaining to avoid calling trim on undefined
    return res.status(400).send("First Name and Last Name are required");
  }

  // Sanitization (Removing leading/trailing whitespace and HTML/CSS/JavaScript injection)
  const sanitizedFirstName = sanitizeHtml(firstName?.trim(), sanitizeConfig); // Using optional chaining to avoid calling trim on undefined
  const sanitizedLastName = sanitizeHtml(lastName?.trim(), sanitizeConfig); // Using optional chaining to avoid calling trim on undefined
  const sanitizedEmailAddress = sanitizeHtml(emailAddress?.trim(), sanitizeConfig); // Using optional chaining to avoid calling trim on undefined
  const sanitizedNotes = sanitizeHtml(notes?.trim(), sanitizeConfig); // Using optional chaining to avoid calling trim on undefined

  const newContact = {
    firstName: sanitizedFirstName,
    lastName: sanitizedLastName,
    emailAddress: sanitizedEmailAddress,
    notes: sanitizedNotes
  };

  dataService.addContact(newContact, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/contacts");
  });
});

// POST update contact
router.post("/contacts/:id", function (req, res, next) {
  // Sanitize user input before updating contact
  const sanitizedFirstName = req.body.firstName ? sanitizeHtml(req.body.firstName.trim(), sanitizeConfig) : '';
  const sanitizedLastName = req.body.lastName ? sanitizeHtml(req.body.lastName.trim(), sanitizeConfig) : '';
  const sanitizedEmailAddress = req.body.emailAddress ? sanitizeHtml(req.body.emailAddress.trim(), sanitizeConfig) : '';
  const sanitizedNotes = req.body.notes ? sanitizeHtml(req.body.notes.trim(), sanitizeConfig) : '';

  const updatedContact = {
    firstName: sanitizedFirstName,
    lastName: sanitizedLastName,
    emailAddress: sanitizedEmailAddress,
    notes: sanitizedNotes
  };

  dataService.updateContact(req.params.id, updatedContact, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect(`/contacts/${req.params.id}`);
  });
});

// DELETE contact
router.delete("/contacts/:id", function (req, res, next) {
  dataService.deleteContact(req.params.id, (err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: "Contact deleted successfully" }); // Return a JSON response
  });
});

module.exports = router;
