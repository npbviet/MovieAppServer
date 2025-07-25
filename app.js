const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Hỗ trợ Cross-Origin Resource Sharing
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu form gửi lên
app.use(express.json()); // Xử lý dữ liệu JSON gửi từ frontend

// Import các routes
const movieRoutes = require("./routes/movies");
const genreRoutes = require("./routes/genres");

app.use("/api/movie", movieRoutes); // Routes phim
app.use("/api/genre", genreRoutes); // Routes thể loại

// Trang chủ (lời chào)
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Shop API!" });
});

// Phần 10: Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Server lắng nghe
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const user = [];
app.post("/user", (req, res) => {
  const { name, email } = req.body;
  user.push({ name, email });
  res.status(200).json({ message: "User added successfully", user });
});
// [{name: dung, emaiail: 12@isjdk}, {name: q2, email: dung@isjdk}]
// keyword: "dung"
app.get("/find", (req, res) => {
  const { name } = req.query;
  const isMatching = user.find((u) => u.name === name || u.email === name);
  if (isMatching) {
    res.status(200).json({ message: "User found" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});
