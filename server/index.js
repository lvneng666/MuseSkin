import { createApp } from './app.js';
import { CONFIG } from './config/env.js';

const app = createApp();

app.listen(CONFIG.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Peaffee server listening on http://localhost:${CONFIG.PORT} (${CONFIG.NODE_ENV})`);
});
