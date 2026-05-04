const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
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

// Connect to the server
const client = new proto.BookService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// ========================
// Helper to print results
// ========================
function log(label, err, response) {
  console.log('\n--- ' + label + ' ---');
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
}

// ========================
// Call each RPC function
// ========================

// 1. Get all books
client.GetAllBooks({}, (err, res) => {
  log('GetAllBooks', err, res);
});

// 2. Get one book
client.GetBook({ id: 1 }, (err, res) => {
  log('GetBook id=1', err, res);
});

// 3. Add a book
client.AddBook(
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', year: 2018 },
  (err, res) => {
    log('AddBook', err, res);
  }
);

// 4. Update a book
client.UpdateBook(
  { id: 1, title: 'The Pragmatic Programmer 2nd Ed' },
  (err, res) => {
    log('UpdateBook id=1', err, res);
  }
);

// 5. Delete a book
client.DeleteBook({ id: 3 }, (err, res) => {
  log('DeleteBook id=3', err, res);
});