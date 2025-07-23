const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../Data/userToken.json");

const Users = {
  all: function () {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  },
};

module.exports = Users;
