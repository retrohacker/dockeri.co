var fs = require("fs");
var path = require("path");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

exports.handler = async function http(req) {
  return {
    type: "text/html; charset=utf8",
    body: html,
  };
};
