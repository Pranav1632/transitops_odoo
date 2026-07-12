import { Router } from 'express';

const router = Router();

// Placeholder route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'maintenance-finance' });
});

export default router;
