import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** server/uploads/ — Western Union receipt files (volume-mounted in Docker, gitignored). */
export const UPLOAD_DIR = path.resolve(fileURLToPath(new URL('../uploads/', import.meta.url)));

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
