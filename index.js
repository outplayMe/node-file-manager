import { createInterface } from 'node:readline';
import { chdir, stdin, stdout, cwd, argv, env } from 'node:process';
import { dirname } from 'node:path';

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
    `\nThank you for using File Manager, ${consoleColors.red}${username}${consoleColors.reset}, goodbye!`
  );
  rl.write('\n');
  rl.close();
};

const handleUserCommand = (command) => {
  switch (command) {
    case 'up':
      currentDirectory = dirname(currentDirectory);
      rl.setPrompt(
        consoleColors.green + currentDirectory + '>' + consoleColors.reset
      );
      break;
  }
};

rl.on('line', (input) => {
  if (input.trim() === '.exit') {
    handleExit();
  } else {
    handleUserCommand(input);
    rl.prompt();
  }
});

rl.on('SIGINT', () => handleExit());

console.log(
  `Welcome to the File Manager, ${consoleColors.red}${username}${consoleColors.reset}!`
);
rl.prompt();
