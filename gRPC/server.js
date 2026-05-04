const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ========================
// Load the proto file
// ========================
const packageDef = protoLoader.loadSync(
  path.join(__dirname, 'books.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const proto = grpc.loadPackageDefinition(packageDef).books;

// ========================
// In-memory data
// ========================
let books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', year: 1999 },
  { id: 2, title: 'Clean Code',               author: 'Robert Martin',  year: 2008 },
  { id: 3, title: "You Don't Know JS",         author: 'Kyle Simpson',   year: 2014 },
];

// ========================
// Service implementations
// Each function maps to one rpc in the proto file
// ========================

function GetBook(call, callback) {
  const book = books.find(b => b.id === call.request.id);
  if (!book) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Book with id ${call.request.id} not found`,
    });
  }
  callback(null, book);
}

function GetAllBooks(call, callback) {
  callback(null, { books });
}

function AddBook(call, callback) {
  const { title, author, year } = call.request;
  const newBook = { id: books.length + 1, title, author, year };
  books.push(newBook);
  callback(null, newBook);
}

function UpdateBook(call, callback) {
  const { id, title, author, year } = call.request;
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Book with id ${id} not found`,
    });
  }
  if (title)  books[idx].title  = title;
  if (author) books[idx].author = author;
  if (year)   books[idx].year   = year;
  callback(null, books[idx]);
}

function DeleteBook(call, callback) {
  const idx = books.findIndex(b => b.id === call.request.id);
  if (idx === -1) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Book with id ${call.request.id} not found`,
    });
  }
  books.splice(idx, 1);
  callback(null, { message: `Book ${call.request.id} deleted successfully` });
}

// ========================
// Start the server
// ========================
const server = new grpc.Server();

server.addService(proto.BookService.service, {
  GetBook,
  GetAllBooks,
  AddBook,
  UpdateBook,
  DeleteBook,
});

server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Server error:', err);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
  }
);