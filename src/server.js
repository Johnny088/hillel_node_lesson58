import http from 'node:http';

import {
  addNewTask,
  deleteTask,
  getById,
  readTasks,
  updateTask,
} from './services/taskService.js';

const PORT = 8000;

const server = http.createServer(async (req, res) => {
  if (req.url === '/tasks' && req.method === 'GET') {
    console.log(req.url);
    const tasks = await readTasks();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tasks));
  } else if (req.url.startsWith('/tasks/') && req.method === 'GET') {
    const urlParts = req.url.split('/');
    const taskId = urlParts[2];

    const task = await getById(Number(taskId));
    if (!task) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'The task was not found' }));
      return;
    }
    res.setHeader('Content-Type', 'Application/json');
    res.end(JSON.stringify(task));
  } else if (req.url === '/tasks' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      const parsedBody = JSON.parse(body);
      const title = parsedBody;

      await addNewTask(title);
      res.statusCode = 201;
      res.end('data recieved');
    });
  } else if (req.url.startsWith('/tasks/') && req.method === 'DELETE') {
    const urlParts = req.url.split('/');
    const id = urlParts[2];

    const result = await deleteTask(Number(id));
    if (!result) {
      res.statusCode = 404;
      res.end(`such '${id}' doesn't exist`);
      return;
    }
    res.statusCode = 204;
    res.end();
  } else if (req.url.startsWith('/tasks/') && req.method === 'PATCH') {
    const urlParts = req.url.split('/');
    const id = urlParts[2];

    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      const parsedBody = JSON.parse(body);
      const result = await updateTask(Number(id), parsedBody);
      if (!result) {
        res.statusCode = 404;
        res.end(`such id: '${id}' doesn't exist`);
        return;
      }
      res.end(`task with the id: '${id}' was updated`);
    });
  } else {
    res.statusCode = 404;
    res.end('something went wrong');
  }
});

server.listen(PORT, () => {
  console.log('server is running on port 8000');
});
