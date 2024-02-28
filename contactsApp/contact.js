class Contact {
  constructor(id, firstName, lastName, email, notes, date,deleted) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.notes = notes;
    this.date = date;
    this.deleted = deleted; 
  }
}

module.exports = Contact;
