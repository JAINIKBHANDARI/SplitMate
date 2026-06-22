import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function start() { await connectDatabase(); app.listen(env.PORT, () => console.info(`SplitMate API listening on :${env.PORT}`)); }
start().catch((error) => { console.error('Unable to start SplitMate', error); process.exit(1); });
