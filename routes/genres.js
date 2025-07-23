const express = require("express");
const genreController = require("../controllers/genreController");

const router = express.Router();

//Lấy danh sách tất cả thể loại phim - GET
router.get("/genres", genreController.getGenres); //http://localhost:5000/api/movie/genre

module.exports = router;
