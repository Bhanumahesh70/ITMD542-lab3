const fs = require('fs');
const path = require('path');

// File path for the data file
const dataFilePath = path.resolve(__dirname, 'data', 'contacts.json');

// Read contacts from the JSON file
function readContacts() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading contacts:', err);
    return [];
  }
}

// Write contacts to the JSON file
function writeContacts(contacts) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(contacts, null, 2));
  } catch (err) {
    console.error('Error writing contacts:', err);
  }
}

module.exports = { readContacts, writeContacts };
