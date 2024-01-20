const { app } = require("electron");
const fs = require("fs");
const userDataPath = app.getPath("userData");
const LAST_FETCHED_DATE_FILE = `${userDataPath}/.lastFetchedDate.txt`;
const NOTE_DIR_FILE = `${userDataPath}/.noteDir.txt`;

console.log(userDataPath);
const SET_SETTINGS_FILE = (file, date) => {
  fs.writeFileSync(file, date);
};

const GET_SETTINGS_FILE = (file) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log("file not found... creating it");
      fs.writeFileSync(file, "");
      return null;
    }
  }
};

module.exports = {
  SET_SETTINGS_FILE,
  GET_SETTINGS_FILE,

  LAST_FETCHED_DATE_FILE,
  NOTE_DIR_FILE,
};
