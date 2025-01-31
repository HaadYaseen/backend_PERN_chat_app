import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { app, server } from './socket/socket';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.route';

dotenv.config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;
// Middleware
app.use(cors(
  {
    origin: FRONTEND_URL,
    credentials: true
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Express with TypeScript!");
});

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});