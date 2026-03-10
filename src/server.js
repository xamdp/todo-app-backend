import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000; // backup port is 5000

// get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);

// get the directory name from the file path
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
// Serves the HTML file from the /public directory
// Tells express to serve all files from the public folder as static assets
app.use(express.static(path.join(__dirname, "../public")));

// Serving up the HTML file from the /public dir
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
app.use("/auth", authRoutes); // basically, use /auth/whatever_the_name_of_route for any routes under authRoutes
app.use("/auth", todoRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});
