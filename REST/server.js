const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// --- In-memory data ---
let books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Hunt & Thomas' },
  { id: 2, title: 'Clean Code',               author: 'Robert Martin'  },
  { id: 3, title: "You Don't Know JS",         author: 'Kyle Simpson'   },
];

// --- GET all books ---
app.get('/books', (req, res) => {
  res.json(books);
});

// --- GET one book by ID ---
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// --- POST create a book ---
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'title and author are required' });
  }
  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

// --- PUT update a book ---
app.put('/books/:id', (req, res) => {
  const idx = books.findIndex(b => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  books[idx] = { ...books[idx], ...req.body };
  res.json(books[idx]);
});

// --- DELETE a book ---
app.delete('/books/:id', (req, res) => {
  const idx = books.findIndex(b => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(idx, 1);
  res.json({ message: 'Deleted', book: deleted[0] });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});