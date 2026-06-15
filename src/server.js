import http from 'node:http';

import { readTasks, writeTasks } from './services/taskService.js';

const PORT = 8000;

const server = http.createServer(async (req, res) => {
  if (req.url === '/tasks' && req.method === 'GET') {
    const tasks = await readTasks();

    res.setHeader('Content-Type', 'application/json');

    res.end(JSON.stringify(tasks));
  } else if (req.url.startsWith('/tasks/') && req.method === 'GET') {
    const urlParts = req.url.split('/');
    const id = Number(urlParts[2]);

    if (Number.isNaN(id)) {
      res.statusCode = 400;
      res.end('Id is required and must be a number');
      return;
    }

    const tasks = await readTasks();

    const task = tasks.find(task => task.id === id);
    if (!task) {
      res.statusCode = 404;
      res.end(`such '${id}' doesn't exist`);
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
      const { title } = JSON.parse(body);

      if (!title || title.trim() === '') {
        console.log('new task can not be empty');
        res.statusCode = 400;
        res.end('the title is required and can not be empty');
        return;
      }
      const tasks = await readTasks();

      const id =
        (tasks.length === 0
          ? 1
          : tasks.reduce((acc, task) => {
              return task.id > acc ? task.id : acc;
            }, 0)) + 1;

      tasks.push({ title, id, completed: false });
      await writeTasks(tasks);

      res.statusCode = 201;
      res.end('data recieved');
    });
  } else if (req.url.startsWith('/tasks/') && req.method === 'DELETE') {
    const urlParts = req.url.split('/');
    const id = Number(urlParts[2]);
    if (Number.isNaN(id)) {
      console.log('Id is required and must be a number');
      res.statusCode = 400;
      res.end('Id is required and must be a number');
      return;
    }

    const tasks = await readTasks();

    const filteredTasks = tasks.filter(task => task.id !== id);
    if (tasks.length === filteredTasks.length) {
      res.statusCode = 404;
      res.end(`such '${id}' doesn't exist`);
      return;
    }

    await writeTasks(filteredTasks);

    res.statusCode = 200;
    res.end('the task was deleted');
  } else if (req.url.startsWith('/tasks/') && req.method === 'PATCH') {
    const urlParts = req.url.split('/');
    const id = Number(urlParts[2]);
    if (Number.isNaN(id)) {
      res.statusCode = 400;
      res.end('Id is required and must be a number');
      return;
    }
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      const parsedBody = JSON.parse(body);

      const tasks = await readTasks();

      const checkId = tasks.find(task => task.id === id);
      if (!checkId) {
        res.statusCode = 404;
        res.end(`such '${id}' doesn't exist`);
        return;
      }

      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, ...parsedBody } : task,
      );

      await writeTasks(updatedTasks);
      res.statusCode = 200;
      res.end(`Task with id '${id}' is updated`);
    });
  } else {
    res.statusCode = 404;
    res.end('something went wrong');
  }
});

server.listen(PORT, () => {
  console.log('server is running on port 8000');
});
