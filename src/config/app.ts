import express from "express";
import { setupMiddleware } from '../middleware/app.middleware';
import { webhookRoute } from '../routes/webhook.route';

const app = express();
setupMiddleware(app)
app.use('/api/webhook/shopee', webhookRoute);
app.use((req, res) => {
    res.status(404).end()
});
app.use((req, res) => {
    res.status(204).end(); // 204 = No Content
});

export default app