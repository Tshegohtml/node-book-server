const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;


app.use(bodyParser.json());


let books = [];


const isValidISBN = (isbn) => {
  return /^\d{13}$/.test(isbn); 
};

const validateBook = (book) => {
  if (!book.title || typeof book.title !== 'string' || book.title.trim() === '') {
    return 'Title is required and must be a non-empty string.';
  }
  if (!book.author || typeof book.author !== 'string' || book.author.trim() === '') {
    return 'Author is required and must be a non-empty string.';
  }
  if (!book.publisher || typeof book.publisher !== 'string' || book.publisher.trim() === '') {
    return 'Publisher is required and must be a non-empty string.';
  }
  if (!book.publishedDate || isNaN(new Date(book.publishedDate).getTime())) {
    return 'Published Date is required and must be a valid date.';
  }
  if (!book.ISBN || !isValidISBN(book.ISBN)) {
    return 'ISBN is required and must be a 13-digit number.';
  }
  return null; 
};


app.post('/books', (req, res) => {
  const { title, author, publisher, publishedDate, ISBN } = req.body;

  
  const validationError = validateBook(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  
  if (books.find((book) => book.ISBN === ISBN)) {
    return res.status(400).json({ error: 'A book with this ISBN already exists.' });
  }


  const newBook = { title, author, publisher, publishedDate, ISBN };
  books.push(newBook);

  res.status(201).json({
    message: 'Book added successfully.',
    book: newBook,
  });
});


app.get('/books', (req, res) => {
  res.status(200).json(books);
});


app.get('B/books/:ISN', (req, res) => {
  const { ISBN } = req.params;
  const book = books.find((b) => b.ISBN === ISBN);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ error: 'Book not found.' });
  }
});


app.put('/books/:ISBN', (req, res) => {
  const { ISBN } = req.params;
  const { title, author, publisher, publishedDate } = req.body;

  const bookIndex = books.findIndex((b) => b.ISBN === ISBN);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }


  const validationError = validateBook(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Update the book
  const updatedBook = { ...books[bookIndex], title, author, publisher, publishedDate };
  books[bookIndex] = updatedBook;

  res.status(200).json({
    message: 'Book updated successfully.',
    book: updatedBook,
  });
});


app.patch('/books/:ISBN', (req, res) => {
  const { ISBN } = req.params;
  const { title, author, publisher, publishedDate } = req.body;

  const bookIndex = books.findIndex((b) => b.ISBN === ISBN);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // Only update provided fields
  if (title) books[bookIndex].title = title;
  if (author) books[bookIndex].author = author;
  if (publisher) books[bookIndex].publisher = publisher;
  if (publishedDate) books[bookIndex].publishedDate = publishedDate;

  res.status(200).json({
    message: 'Book partially updated successfully.',
    book: books[bookIndex],
  });
});

// DELETE endpoint to delete a book by ISBN
app.delete('/books/:ISBN', (req, res) => {
  const { ISBN } = req.params;
  const bookIndex = books.findIndex((b) => b.ISBN === ISBN);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // Remove the book from the array
  books.splice(bookIndex, 1);

  res.status(200).json({
    message: 'Book deleted successfully.',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
