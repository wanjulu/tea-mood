import { Router } from 'express';
import db from '../db/init.js';
import { getWeather } from '../services/weather.js';

const router = Router();

router.get('/weather', async (_req, res) => {
  try {
    res.json(await getWeather());
  } catch {
    res.status(503).json({ error: '無法取得天氣' });
  }
});

router.post('/logs', async (req, res) => {
  const { tea_name, mood, rating, notes } = req.body;
  if (!tea_name?.trim() || !mood?.trim() || !rating) {
    return res.status(400).json({ error: '請填寫必要欄位' });
  }

  let weather = null, temperature = null;
  try {
    ({ weather, temperature } = await getWeather());
  } catch { /* weather is optional, don't block save */ }

  const { lastInsertRowid } = db.prepare(
    `INSERT INTO tea_logs (tea_name, mood, rating, notes, weather, temperature)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(tea_name.trim(), mood.trim(), Number(rating), notes?.trim() || null, weather, temperature);

  const log = db.prepare('SELECT * FROM tea_logs WHERE id = ?').get(lastInsertRowid);
  res.json(log);
});

router.get('/logs', (_req, res) => {
  const logs = db.prepare('SELECT * FROM tea_logs ORDER BY created_at DESC').all();
  res.json(logs);
});

router.delete('/logs/:id', (req, res) => {
  db.prepare('DELETE FROM tea_logs WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
