const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const PORT = 5000;

// =====================
// STEP 1 — Define Schema
// This is the contract — what data exists and what operations are allowed
// =====================
const schema = buildSchema(`
  type Book {
    id: Int
    title: String
    author: String
    year: Int
  }

  type DeleteResponse {
    message: String
  }

  # Query = READ operations (like GET in REST)
  type Query {
    getBook(id: Int!): Book
    getAllBooks: [Book]
  }

  # Mutation = WRITE operations (like POST, PUT, DELETE in REST)
  type Mutation {
    addBook(title: String!, author: String!, year: Int!): Book
    updateBook(id: Int!, title: String, author: String, year: Int): Book
    deleteBook(id: Int!): DeleteResponse
  }
`);

// =====================
// STEP 2 — Define Resolvers
// These are the actual functions that run when a query/mutation is called
// =====================
let books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', year: 1999 },
  { id: 2, title: 'Clean Code',               author: 'Robert Martin',  year: 2008 },
  { id: 3, title: "You Don't Know JS",         author: 'Kyle Simpson',   year: 2014 },
];

const root = {
  // --- Queries ---
  getBook: ({ id }) => {
    const book = books.find(b => b.id === id);
    if (!book) throw new Error(`Book with id ${id} not found`);
    return book;
  },

  getAllBooks: () => books,

  // --- Mutations ---
  addBook: ({ title, author, year }) => {
    const newBook = { id: books.length + 1, title, author, year };
    books.push(newBook);
    return newBook;
  },

  updateBook: ({ id, title, author, year }) => {
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Book with id ${id} not found`);
    books[idx] = {
      ...books[idx],
      ...(title  && { title  }),
      ...(author && { author }),
      ...(year   && { year   }),
    };
    return books[idx];
  },

  deleteBook: ({ id }) => {
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) throw new Error(`Book with id ${id} not found`);
    books.splice(idx, 1);
    return { message: `Book ${id} deleted successfully` };
  },
};

// =====================
// STEP 3 — Mount GraphQL on a single endpoint
// =====================
app.get('/', (req, res) => res.redirect('/graphql'));

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,   // enables the built-in browser playground
}));

app.listen(PORT, () => {
  console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
});