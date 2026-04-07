import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const response = await fetch('https://openrouter.ai/api/v1/models');
const data = await response.json();

const fixturePath = path.resolve(__dirname, './tests/fixtures/openrouter-models.json');
await fs.mkdir(path.dirname(fixturePath), { recursive: true });
await fs.writeFile(fixturePath, JSON.stringify(data), 'utf-8');
console.log('Fixture updated!');
