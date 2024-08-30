const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
  } else if (req.url === '/note.js') {
    fs.readFile(path.join(__dirname, 'note.js'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading note.js');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
      }
    });
  } else if (req.url === '/guitarneck.js') {
    fs.readFile(path.join(__dirname, 'guitarneck.js'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading guitarneck.js');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});