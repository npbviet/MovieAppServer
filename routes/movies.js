const express = require("express");
const movieController = require("../controllers/movieController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Lấy danh sách phim đang thịnh hành (Trending Movies) - GET
router.get("/trending", movieController.getTrending); // http://localhost:5000/api/movie/trending

// Lấy danh sách phim có rating cao nhất (Top-Rated Movies) - GET
router.get("/top-rate", movieController.getTopRatedMovies); // http://localhost:5000/api/movie/top-rate

// Lấy phim theo thể loại cụ thể (Discover Movies by Genre) - GET
router.get("/discover", movieController.discoverMoviesByGenre); // http://localhost:5000/api/movie/discover?genre=28&page=1

// Lấy trailer hoặc teaser của phim theo `film_id` - GET
router.get("/video", movieController.getMovieTrailer); // http://localhost:5000/api/movie/video?film_id=361743

// Tìm kiếm nâng cao phim với từ khóa và bộ lọc - POST
router.post("/search", authenticate, movieController.searchMovies); // http://localhost:5000/api/movie/search

module.exports = router;
