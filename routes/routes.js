module.exports = [
  require("./rendering-info/web.js"),
  require("./stylesheet.js"),
  require("./script.js"),
  require("./health.js"),
  require("./fixtures/data.js"),
  require("./dynamic-enum.js")
].concat(require("./schema.js"));
