const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5173;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any request that doesn't match a static file, send index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});