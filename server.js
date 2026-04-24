import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logsRouter from './routes/logs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/api', logsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍵  Tea Mood 已啟動 → http://localhost:${PORT}\n`);
});
