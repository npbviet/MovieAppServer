const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/movieList.json");

const Movies = {
  all: function () {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  },
};

module.exports = Movies;
