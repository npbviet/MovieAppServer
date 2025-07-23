const Genre = require("../models/Genres");

exports.getGenres = (req, res, next) => {
  try {
    const genres = Genre.all();

    // Kiểm tra nếu dữ liệu không hợp lệ
    if (!genres || !Array.isArray(genres)) {
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách thể loại." });
    }

    res.status(200).json({ genres });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi.", error: error.message });
  }
};
