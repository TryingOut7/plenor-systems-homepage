import fs from 'node:fs';
import path from 'node:path';

export function parseFlag(argv, flagName) {
  return argv.slice(2).includes(flagName);
}

export function parseStringOption(argv, optionName, fallback = '') {
  const prefix = `${optionName}=`;
  for (const raw of argv.slice(2)) {
    if (raw.startsWith(prefix)) {
      return raw.slice(prefix.length).trim();
    }
  }
  return fallback;
}

export function parseNumberOption(argv, optionName, fallback, minimum = 1) {
  const raw = parseStringOption(argv, optionName, '');
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= minimum ? parsed : fallback;
}

export function resolvePathFromCwd(targetPath) {
  if (!targetPath) return '';
  return path.isAbsolute(targetPath) ? targetPath : path.join(process.cwd(), targetPath);
}

export function readJsonFile(targetPath) {
  const absolutePath = resolvePathFromCwd(targetPath);
  const raw = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(raw);
}

export function writeJsonFile(targetPath, data) {
  const absolutePath = resolvePathFromCwd(targetPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
  return absolutePath;
}

export function runCli(main, failureMessage) {
  Promise.resolve()
    .then(() => main())
    .then(() => {
      process.exit(process.exitCode ?? 0);
    })
    .catch((error) => {
      console.error(failureMessage, error);
      process.exit(1);
    });
}
