import { Router } from 'express';

const router = Router();

// Placeholder route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'fleet-identity' });
});

export default router;
