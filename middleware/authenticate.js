const users = require("../models/Users");

const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header, body hoặc query
    const token =
      req.headers["authorization"] || req.body.token || req.query.token;

    // Kiểm tra nếu token bị thiếu
    if (!token) {
      return res
        .status(401)
        .json({ error: "Unauthorized", reason: "Token bị thiếu." });
    }

    // Lấy danh sách user từ file `userToken.json`
    const allUsers = users.all();

    // Tìm user theo token
    const user = allUsers.find((u) => u.token === token);

    // Kiểm tra nếu user không hợp lệ
    if (!user) {
      return res
        .status(401)
        .json({ error: "Unauthorized", reason: "Token không hợp lệ." });
    }

    // Gắn user vào request để sử dụng trong các route khác
    req.user = user;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

module.exports = authenticate;
