import chalk from 'chalk';
import { DB_PATH } from '../constants.js';

import fs from 'fs/promises';

export const readTasks = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsedData = JSON.parse(data);

    return parsedData;
  } catch (error) {
    console.log(chalk.red(error));
    return [];
  }
};

export const writeTasks = async tasks => {
  await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2));
};

export const getById = async id => {
  if (Number.isNaN(id)) {
    console.log(chalk.red('Id is required and must be a number'));
    return;
  }

  const tasks = await readTasks();

  const task = tasks.find(task => task.id === id);
  if (!task) {
    console.log(chalk.red(`task with such id: '${id}' doesn't exist`));
    return;
  }
  return task;
};

export const addNewTask = async newTask => {
  if (!newTask || newTask.trim() === '') {
    console.log('new task can not be empty');
    return;
  }
  const tasks = await readTasks();

  const id =
    (tasks.length === 0
      ? 1
      : tasks.reduce((acc, task) => {
          return task.id > acc ? task.id : acc;
        }, 0)) + 1;

  tasks.push({ title: newTask, id, completed: false });
  await writeTasks(tasks);
};

export const deleteTask = async id => {
  if (Number.isNaN(id)) {
    console.log(chalk.red('Id is required and must be a number'));
    return false;
  }

  const tasks = await readTasks();

  const checkId = await tasks.find(task => task.id === id);
  if (!checkId) {
    console.log(chalk.red(`task with a such id '${id}' doesn't exist `));
    return false;
  }

  const filteredTasks = tasks.filter(task => task.id !== id);

  await writeTasks(filteredTasks);

  console.log(chalk.red(`Task with an id '${id}' is deleted`));
  return true;
};

export const updateTask = async (id, newTask) => {
  if (Number.isNaN(id)) {
    console.log(chalk.red('Id is required and must be a number'));
    return false;
  }

  const tasks = await readTasks();

  const checkId = tasks.find(task => task.id === id);
  if (!checkId) {
    console.log(chalk.red(`task with a such id '${id}' doesn't exist `));
    return false;
  }

  const updatedTasks = tasks.map(task =>
    task.id === id ? { ...task, ...newTask } : task,
  );

  await writeTasks(updatedTasks);
  console.log(chalk.green(`Task with id '${id}' is updated`));
  return true;
  //   console.log(newTask);
};
