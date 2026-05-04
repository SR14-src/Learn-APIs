# Learn APIs

A hands-on reference project that implements the same **Books** CRUD domain across five major API paradigms in Node.js — so you can directly compare how each style works.

## API Styles Covered

| Style | Folder | Port | Protocol |
|---|---|---|---|
| REST | `REST/` | 3000 | HTTP |
| SOAP | `SOAP/` | 4000 | HTTP + XML |
| GraphQL | `GRAPH-QL/` | 5000 | HTTP |
| WebSocket | `WebSocket/` | 8080 | WS |
| gRPC | `gRPC/` | 50051 | HTTP/2 |

---

## Getting Started

Each folder is a self-contained Node.js project. Install dependencies and start the server independently.

```bash
cd REST          # or SOAP, GRAPH-QL, WebSocket, gRPC
npm install
node server.js
```

---

## REST (`REST/`)

A standard CRUD API built with **Express**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get a book by ID |
| POST | `/books` | Add a new book |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

---

## SOAP (`SOAP/`)

A **SOAP** web service built with Express + `soap` package. The contract is defined in `books.wsdl`.

**Operations:** `GetBook`, `GetAllBooks`, `AddBook`, `UpdateBook`, `DeleteBook`

WSDL available at: `http://localhost:4000/books?wsdl`

---

## GraphQL (`GRAPH-QL/`)

A **GraphQL** API built with Express + `express-graphql`. Playground available at `http://localhost:5000/graphql`.

**Queries:**
```graphql
query { getAllBooks { id title author year } }
query { getBook(id: 1) { title author } }
```

**Mutations:**
```graphql
mutation { addBook(title: "...", author: "...", year: 2024) { id } }
mutation { updateBook(id: 1, title: "New Title") { title } }
mutation { deleteBook(id: 1) { message } }
```

---

## WebSocket (`WebSocket/`)

A real-time chat/broadcast server built with **ws** library. Open `client.html` in a browser or connect to `ws://localhost:8080`.

Each connected client gets a unique ID. Messages sent by one client are broadcast to all others.

---

## gRPC (`gRPC/`)

A **gRPC** service defined in `books.proto` using `@grpc/grpc-js`.

**RPCs:** `GetBook`, `GetAllBooks`, `AddBook`, `UpdateBook`, `DeleteBook`

Run the server, then test with the client:
```bash
node server.js   # terminal 1
node client.js   # terminal 2
```

---

## Tech Stack

- **Runtime:** Node.js
- **REST / SOAP / GraphQL / WebSocket servers:** Express
- **GraphQL:** `graphql`, `express-graphql`
- **SOAP:** `soap`
- **WebSocket:** `ws`
- **gRPC:** `@grpc/grpc-js`, `@grpc/proto-loader`
