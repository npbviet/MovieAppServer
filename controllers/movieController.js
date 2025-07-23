const Movies = require("../models/Movies");
const Genres = require("../models/Genres");
const Videos = require("../models/Videos");

//Kiểm tra số trang (phần 4,5,6,8+12)
const getValidPage = (page, totalPages) => {
  const pageNum = parseInt(page, 10);
  return isNaN(pageNum) || pageNum < 1 ? 1 : Math.min(pageNum, totalPages);
};
//Lấy dữ liệu tất cả movies (phần 4,5,6,8+12)
const getMoviesData = () => {
  const movies = Movies.all();
  if (!movies || !Array.isArray(movies)) {
    throw new Error("Lỗi khi lấy danh sách phim.");
  }
  return movies;
};
//Lấy dữ liệu tất cả videos trailer (phần 7)
const getVideosData = () => {
  const videos = Videos.all();
  if (!videos || !Array.isArray(videos)) {
    throw new Error("Lỗi khi lấy danh sách video.");
  }
  return videos;
};
//Lấy dữ liệu id phim (phần 7)
const getValidFilmId = (film_id) => {
  const idNum = parseInt(film_id, 10);
  if (isNaN(idNum) || idNum < 1) {
    throw new Error("ID phim không hợp lệ.");
  }
  return idNum;
};

//Phần 4: Lấy phim top trending
exports.getTrending = (req, res, next) => {
  try {
    const moviesPerPage = 20;
    const trendingMovies = getMoviesData();

    const totalMovies = trendingMovies.length;
    const totalPages = Math.ceil(totalMovies / moviesPerPage);
    const currentPage = getValidPage(req.query.page, totalPages);

    const results = trendingMovies
      .sort((a, b) => b.popularity - a.popularity)
      .slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage);

    res.status(200).json({
      results,
      page: currentPage,
      total_pages: totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Phần 5: Lấy phim top rating
exports.getTopRatedMovies = (req, res, next) => {
  try {
    const itemsPerPage = 10;
    const allMovies = getMoviesData();

    const totalMovies = allMovies.length;
    const totalPages = Math.ceil(totalMovies / itemsPerPage);
    const currentPage = getValidPage(req.query.page, totalPages);

    const sortedMovies = allMovies
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    res.status(200).json({
      results: sortedMovies,
      page: currentPage,
      total_results: totalMovies,
      total_pages: totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Phần 6: Lấy phim theo thể loại
exports.discoverMoviesByGenre = (req, res, next) => {
  try {
    const moviesPerPage = 20;
    const { genre } = req.query;

    // Kiểm tra đầu vào
    if (!genre || isNaN(genre)) {
      return res
        .status(400)
        .json({ message: "Thể loại không hợp lệ hoặc bị thiếu." });
    }

    const genreId = Number(genre);
    const allMovies = getMoviesData();
    const genreObj = Genres.all().find((g) => g.id === genreId);

    if (!genreObj) {
      return res.status(404).json({ message: "Không tìm thấy thể loại." });
    }

    // Lọc phim theo thể loại
    const filteredMovies = allMovies.filter((movie) =>
      movie.genre_ids?.includes(genreId)
    );

    // Tính tổng số phim và tổng số trang
    const totalMovies = filteredMovies.length;
    const totalPages = Math.ceil(totalMovies / moviesPerPage);
    const currentPage = getValidPage(req.query.page, totalPages);

    // Lấy danh sách phim của trang hiện tại
    const results = filteredMovies.slice(
      (currentPage - 1) * moviesPerPage,
      currentPage * moviesPerPage
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có phim nào cho trang này." });
    }

    res.status(200).json({
      results,
      page: currentPage,
      total_pages: totalPages,
      genre_name: genreObj.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi.", error: error.message });
  }
};

//Phần 7: Lấy trailer phim
exports.getMovieTrailer = (req, res, next) => {
  try {
    const { film_id } = req.query;
    if (!film_id) {
      return res.status(400).json({ message: "Thiếu film_id trong request." });
    }

    const validFilmId = getValidFilmId(film_id);
    const videosData = getVideosData();

    // Tìm phim theo `film_id`
    const film = videosData.find((movie) => movie.id === validFilmId);
    if (!film) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy video cho phim này." });
    }

    // Lọc các video thỏa mãn điều kiện
    const eligibleVideos = film.videos.filter(
      (video) =>
        video.official === true &&
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser")
    );

    // Nếu không có video phù hợp, trả về lỗi 404
    if (eligibleVideos.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có trailer hoặc teaser cho phim này." });
    }

    // Sắp xếp video theo thời gian `published_at` (mới nhất trước)
    eligibleVideos.sort(
      (a, b) => new Date(b.published_at) - new Date(a.published_at)
    );

    // Trả về video phù hợp nhất
    res.status(200).json(eligibleVideos[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Phần 8 + 12: Chức năng search + search nâng caocao
exports.searchMovies = (req, res, next) => {
  try {
    console.log("Dữ liệu nhận từ frontend:", req.body);
    const {
      keyword,
      genre,
      mediaType,
      language,
      year,
      page = 1,
      limit = 20,
    } = req.body;

    // Kiểm tra nếu không có `keyword`
    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm." });
    }

    const allMovies = getMoviesData();
    const lowerKeyword = keyword.toLowerCase();

    // Tìm kiếm theo keyword (title, name hoặc overview)
    let filteredMovies = allMovies.filter((movie) => {
      const title = movie.title ? movie.title.toLowerCase() : "";
      const name = movie.name ? movie.name.toLowerCase() : "";
      const overview = movie.overview ? movie.overview.toLowerCase() : "";

      return (
        title.includes(lowerKeyword) ||
        name.includes(lowerKeyword) ||
        overview.includes(lowerKeyword)
      );
    });
    console.log("Số phim sau lọc keyword:", filteredMovies.length);

    // Lọc theo genre (nếu có)
    if (genre) {
      filteredMovies = filteredMovies.filter(
        (movie) => movie.genre_ids && movie.genre_ids.includes(Number(genre))
      );
    }
    console.log("Số phim sau lọc genre:", filteredMovies.length);
    // Lọc theo mediaType (nếu có)
    if (mediaType && mediaType !== "all") {
      filteredMovies = filteredMovies.filter(
        (movie) => movie.media_type && movie.media_type === mediaType
      );
    }
    console.log("Số phim sau lọc mediatype:", filteredMovies.length);
    // Lọc theo language (nếu có)
    if (language) {
      filteredMovies = filteredMovies.filter(
        (movie) =>
          movie.original_language && movie.original_language === language
      );
    }
    console.log("Số phim sau lọc language:", filteredMovies.length);

    // Lọc theo năm phát hành (nếu có)
    if (year) {
      filteredMovies = filteredMovies.filter((movie) =>
        movie.release_date
          ? movie.release_date.startsWith(year.toString())
          : false
      );
    }

    // Tính tổng số phim và tổng số trang
    const totalMovies = filteredMovies.length;
    const totalPages = Math.ceil(totalMovies / limit);
    const currentPage = getValidPage(page, totalPages);

    // Phân trang
    const results = filteredMovies.slice(
      (currentPage - 1) * limit,
      currentPage * limit
    );

    // Kiểm tra nếu không có kết quả
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có phim nào phù hợp với các bộ lọc." });
    }

    res.status(200).json({
      results,
      page: currentPage,
      total_results: totalMovies,
      total_pages: totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi.", error: error.message });
  }
};
