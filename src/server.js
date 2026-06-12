import http from 'node:http';

import { readTasks } from './services/taskService.js';

const PORT = 8000;

const server = http.createServer(async (req, res) => {
  if (req.url === '/users' && req.method === 'GET') {
    const tasks = await readTasks();

    res.setHeader('Content-Type', 'application/json');

    res.end(JSON.stringify(tasks));
  }
});

server.listen(PORT, () => {
  console.log('server is running on port 8000');
});
