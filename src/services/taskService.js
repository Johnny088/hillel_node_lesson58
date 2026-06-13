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
