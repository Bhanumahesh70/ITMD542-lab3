const sqlite3 = require('sqlite3').verbose();

class DataService {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.initDatabase();
  }

  initDatabase() {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        emailAddress TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    });
  }

  getAllContacts(callback) {
    this.db.all('SELECT * FROM contacts', (err, rows) => {
      callback(err, rows);
    });
  }

  getContactById(id, callback) {
    this.db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
      callback(err, row);
    });
  }

  addContact(contact, callback) {
    const { firstName, lastName, emailAddress, notes } = contact;
    const createdAt = new Date().toISOString();
    this.db.run(
      'INSERT INTO contacts (firstName, lastName, emailAddress, notes, createdAt) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, emailAddress, notes, createdAt],
      (err) => {
        callback(err);
      }
    );
  }

  updateContact(id, contact, callback) {
    const { firstName, lastName, emailAddress, notes } = contact;
    this.db.run(
      'UPDATE contacts SET firstName = ?, lastName = ?, emailAddress = ?, notes = ? WHERE id = ?',
      [firstName, lastName, emailAddress, notes, id],
      (err) => {
        callback(err);
      }
    );
  }

  deleteContact(id, callback) {
    this.db.run('DELETE FROM contacts WHERE id = ?', [id], (err) => {
      callback(err);
    });
  }
}

module.exports = DataService;
