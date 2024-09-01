const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Serve the index.html file
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, './public/index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    });
  } 
  // Serve the bundled JavaScript file
  else if (req.url === '/bundle.js') {
    fs.readFile(path.join(__dirname, './public/bundle.js'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading bundle.js');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
      }
    });
  } 
  // Serve other static files (e.g., CSS, images)
  else {
    const filePath = path.join(__dirname, 'public', req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
      } else {
        const ext = path.extname(filePath);
        let contentType = 'text/plain';
        switch (ext) {
          case '.js':
            contentType = 'application/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.html':
            contentType = 'text/html';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
            contentType = 'image/jpeg';
            break;
          // Add more content types as needed
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});