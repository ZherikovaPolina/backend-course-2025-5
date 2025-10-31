const { program } = require('commander');
const fs = require('fs');
const http = require('http');
const path = require('path');

program
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <dir>', 'Path to cache directory');

program.parse();
const options = program.opts();

if (!fs.existsSync(options.cache)) {
  fs.mkdirSync(options.cache, { recursive: true });
}

const server = http.createServer(async (req, res) => {
  const code = req.url.split('/')[1] || '';
  const filePath = path.join(options.cache, `${code}.jpg`);


  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('405 Method Not Allowed');
  }

  try {
    const data = await fs.promises.readFile(filePath);
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});