const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// --- In-memory data ---
let books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas' },
  { id: 2, title: 'Clean Code',               author: 'Robert Martin'  },
  { id: 3, title: "You Don't Know JS",         author: 'Kyle Simpson'   },
];

// --- Service implementation ---
// These are the actual functions that run when a SOAP operation is called
const service = {
  BooksService: {
    BooksPort: {

      GetBook: function (args) {
        const book = books.find(b => b.id === Number(args.id));
        if (!book) {
          throw { Fault: { faultcode: 'Client', faultstring: 'Book not found' } };
        }
        return book;
      },

      AddBook: function (args) {
        const newBook = {
          id: books.length + 1,
          title: args.title,
          author: args.author,
        };
        books.push(newBook);
        return { ...newBook, message: 'Book added successfully' };
      },

      DeleteBook: function (args) {
        const idx = books.findIndex(b => b.id === Number(args.id));
        if (idx === -1) {
          throw { Fault: { faultcode: 'Client', faultstring: 'Book not found' } };
        }
        books.splice(idx, 1);
        return { message: `Book ${args.id} deleted successfully` };
      },

    }
  }
};

// --- Load WSDL and start server ---
const wsdl = fs.readFileSync(path.join(__dirname, 'books.wsdl'), 'utf8');

const server = app.listen(PORT, () => {
  console.log(`SOAP server running at http://localhost:${PORT}/books?wsdl`);
});

soap.listen(server, '/books', service, wsdl);