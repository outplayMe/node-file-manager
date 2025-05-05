import { createInterface } from 'node:readline';
import { stdin, stdout, argv, env } from 'node:process';
import { dirname, resolve, join } from 'node:path';
import { readdir, writeFile, stat, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import consoleColors from './colors.js';

let currentDirectory = env.HOME;

const rl = createInterface({
  input: stdin,
  output: stdout,
  prompt: consoleColors.green + currentDirectory + '>' + consoleColors.reset,
});

const parseUsername = () => {
  const arg = argv.find((arg) => arg.startsWith('--username='));
  return arg ? arg.split('=')[1] : 'Human';
};

const username = parseUsername();

rl.on('line', async (input) => {
  if (input.trim() === '.exit') {
    handleExit();
  } else {
    await handleUserCommand(input);
    rl.prompt();
  }
});
rl.on('SIGINT', () => handleExit());

console.log(
  `Welcome to the File Manager, ${consoleColors.red}${username}${consoleColors.reset}!`
);

rl.prompt();

const handleExit = () => {
  console.log(
    `\nThank you for using File Manager, ${consoleColors.red}${username}${consoleColors.reset}, goodbye!\n`
  );
  rl.close();
};

const handleUserCommand = async (userInput) => {
  const [command, ...args] = userInput.trim().split(' ');
  switch (command) {
    case 'up':
      currentDirectory = dirname(currentDirectory);
      rl.setPrompt(
        consoleColors.green + currentDirectory + '>' + consoleColors.reset
      );
      break;
    case 'cd':
      const userPath = args.join('');
      if (!userPath.length) {
        console.log(
          consoleColors.red +
            'Error: Invalid input, you must specify correct path' +
            consoleColors.reset
        );
        break;
      }
      const targetPath = resolve(currentDirectory, userPath);
      try {
        const stats = await stat(targetPath);
        if (stats.isDirectory()) {
          currentDirectory = targetPath;
        } else {
          console.log(
            consoleColors.red +
              `Error: ${targetPath} is not a directory` +
              consoleColors.reset
          );
        }
      } catch {
        console.log(
          consoleColors.red +
            `Error: ${targetPath} not exist` +
            consoleColors.reset
        );
      }

      rl.setPrompt(
        consoleColors.green + currentDirectory + '>' + consoleColors.reset
      );
      break;
    case 'ls':
      try {
        const files = await readdir(currentDirectory, { withFileTypes: true });
        const result = [];
        for (const file of files) {
          const fileInfo = {
            name:
              file.name.length > 20
                ? file.name.slice(0, 20) + '...'
                : file.name,
            type: file.isDirectory() ? 'directory' : 'file',
          };
          result.push(fileInfo);
        }
        result.sort((a, b) =>
          a.name.localeCompare(b, 'en', { sensitivity: 'base' })
        );
        result.sort((a, b) => {
          if (a.type !== b.type && a.type === 'directory') return -1;
        });

        console.table(result);
      } catch (error) {
        console.log(error.message);
      }
      break;
    case 'cat':
      const filePath = args.join('');
      if (!filePath.length) {
        console.log(
          consoleColors.red +
            'Error: Invalid input, you must specify correct path' +
            consoleColors.reset
        );
        break;
      }
      const catPath = resolve(currentDirectory, filePath);
      const readStream = createReadStream(catPath);
      readStream.pipe(stdout);
      readStream.on('end', () => {
        rl.prompt();
      });
      break;
    case 'add':
      const fileName = args.join('');
      try {
        await writeFile(join(currentDirectory, fileName), '', { flag: 'ax+' });
        console.log('file created');
      } catch (err) {
        console.log('Operation failed\n', err.message);
      }
      break;
    case 'mkdir':
      const userDirname = args.join('');
      try {
        await mkdir(join(currentDirectory, userDirname));
      } catch (err) {
        console.log('Operation failed\n', err.message);
      }
      break;
  }
};
