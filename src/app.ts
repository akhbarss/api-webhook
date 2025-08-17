import express from "express";
import { setupMiddleware } from './middleware/app.middleware';
import { webhookRoute } from './routes/webhook.route';

const app = express();
setupMiddleware(app)
app.use('/api/webhook/shopee',  webhookRoute);

export default app