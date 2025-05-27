import express, { json } from "express";
import cors from "cors";

import authRoutes from "./router/authRoutes";
import userRoutes from "./router/userRoutes";
import projectRoutes from "./router/projectRoutes";
import errorHandler from "./helper/errorHandler";

const PORT = 8003;
const app = express();

app.use(cors());
app.use(json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
