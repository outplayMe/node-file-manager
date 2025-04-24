import { createInterface } from 'node:readline';
import { chdir, stdin, stdout, cwd, argv, env } from 'node:process';
import { dirname, resolve } from 'node:path';
import { access, stat } from 'node:fs/promises';

const consoleColors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: `\x1b[32m`,
  reset: `\x1b[0m`,
};

let currentDirectory = env.HOME; // одно и то же с os.homeDir()

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
  }
};

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
