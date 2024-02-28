const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Contact = require("../contact");

const sanitizeHtml = require("sanitize-html");
const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'escape',
   disallowedTags: ['script', 'style'],
   allowedAttributes: {}, // No attributes allowed
   allowedClasses: {} // No classes allowed
};

// Read the contacts from JSON file
function readContacts() {
  const data = fs.readFileSync(
    path.resolve(__dirname, "..", "data", "contacts.json")
  );
  let contacts = JSON.parse(data);

  // Filter out contacts that are marked as deleted
  contacts = contacts.filter((contact) => !contact.deleted);

  return contacts;
}


// Write contacts to JSON file
function writeContacts(contacts) {
  fs.writeFileSync(
    path.resolve(__dirname, "..", "data", "contacts.json"),
    JSON.stringify(contacts, null, 2)
  );
}


// GET all contacts 
router.get("/contacts", function (req, res, next) {
  const contacts = readContacts();
  res.render("contact/display_all_contacts", { contacts });
});



// GET create new contact form method
router.get("/contacts/create", function (req, res, next) {
  const emptyContact = {}; // Create an empty contact object
  res.render("contact/create_contact", { contact: emptyContact }); // Pass the empty contact object to the template
});


// GET contact by ID
router.get("/contacts/:id", function (req, res, next) {
  const contacts = readContacts();
  console.log("Invoking GET contact by Id method ");
 // console.log("All Contacts:", contacts); // Log all contacts
  const contact = contacts.find((c) => c.id === req.params.id);
  //console.log("Found Contact:", contact); // Log the found contact
  if (!contact) {
    // Handle case when contact is not found
    //return res.status(404).send("Contact not found");
    console.log("Contact not found inside ET contact by Id")
    return res.render("contact/deleted_contact",{contacts});
  }
  res.render("contact/show_contact", { contact });
});


// GET edit contact form
router.get('/contacts/:id/edit', function(req, res, next) {
  const contacts = readContacts();
  console.log("Invoking GET edit contact method ")
  const contact = contacts.find(c => c.id === req.params.id);
  res.render('contact/edit_contact', { contact });
});



// POST create contact 
router.post("/contacts", function (req, res, next) {
 // Validation
 const { firstName, lastName, email, notes } = req.body;
 if (!firstName.trim() || !lastName.trim()) {
   return res.status(400).send("First Name and Last Name are required");
 }

 // Sanitization (Removing leading/trailing whitespace and HTML/CSS/JavaScript injection)
 const sanitizedFirstName = sanitizeHtml(firstName.trim(), sanitizeConfig);
 const sanitizedLastName = sanitizeHtml(lastName.trim(), sanitizeConfig);
 const sanitizedEmail = sanitizeHtml(email.trim(), sanitizeConfig);
 const sanitizedNotes = sanitizeHtml(notes.trim(),sanitizeConfig);

 const newContact = new Contact(
   Math.random().toString(36).substr(2, 9),
   sanitizedFirstName,
   sanitizedLastName,
   sanitizedEmail,
   sanitizedNotes,
   new Date().toISOString(),
   false
 );

 const contacts = readContacts();
 contacts.push(newContact);
 writeContacts(contacts);
 res.redirect("/contacts");
});


// POST update contact
router.post("/contacts/:id", function (req, res, next) {
  const contacts = readContacts();
  const index = contacts.findIndex((c) => c.id === req.params.id);
  console.log("Invoking POST update contact method invoked");
  // If contact not found, return 404
  if (index === -1) {
    return res.status(404).send("Contact not found");
  }

  // Sanitize user input before updating contact
  const sanitizedFirstName = req.body.firstName ? sanitizeHtml(req.body.firstName.trim(), sanitizeConfig) : '';
  const sanitizedLastName = req.body.lastName ? sanitizeHtml(req.body.lastName.trim(), sanitizeConfig) : '';
  const sanitizedEmail = req.body.email ? sanitizeHtml(req.body.email.trim(), sanitizeConfig) : '';
  const sanitizedNotes = req.body.notes ? sanitizeHtml(req.body.notes.trim(), sanitizeConfig) : '';

  contacts[index] = {
    id: req.params.id,
    firstName: sanitizedFirstName,
    lastName: sanitizedLastName,
    email: sanitizedEmail,
    notes: sanitizedNotes,
    date: new Date().toISOString(),
    deleted: false
  };

  // Write updated contacts to file
  writeContacts(contacts);

  // Redirect to the updated contact
  res.redirect(`/contacts/${req.params.id}`);
});



 // DELETE contact
 router.delete("/contacts/:id", function (req, res, next) {
  let contacts = readContacts();
  const index = contacts.findIndex((c) => c.id === req.params.id);
  console.log("Invoking DELETE Method invoked");
  if (index !== -1) {
    // Mark the contact as deleted
    contacts[index].deleted = true;
    console.log("One contact is marked as deleted");
    writeContacts(contacts);
    console.log("Redirecting to all contacts after marking the contact as deleted");
    res.json({ message: "Contact deleted successfully" }); // Return a JSON response
  } else {
    console.log("The contact is not found to delete. Redirecting to contact not found error page");
    res.status(404).json({ error: "Contact not found" }); // Return a JSON response
  }
});



module.exports = router;
