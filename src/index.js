import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import propertiesRoutes from "./routes/properties.routes.js";
import messageRoutes from "./routes/message.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import agentRoutes from './routes/agent.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import chatRoutes from './routes/chat.routes.js';
import paymentRoutes from './routes/payment.routes.js'
import { connectDB } from "./lib/db.js";
import {app, server} from "./lib/socket.js"

dotenv.config();


const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://resivana.onrender.com",
      "https://resivana-abdul-hameeds-projects-3a791a40.vercel.app",
      "https://resivana.vercel.app/",
      "https://vercel.com/abdul-hameeds-projects-3a791a40/resivana/EaksLMKzTsSNi3JXns25KQXSqdEp",
    ],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/property", propertiesRoutes);
app.use("/api/agent", agentRoutes)
app.use("/api/messages", messageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/friends", friendsRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes )

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
