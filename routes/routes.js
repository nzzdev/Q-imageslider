module.exports = [
  require("./rendering-info/web.js"),
  require("./rendering-info/web-images.js"),
  require("./stylesheet.js"),
  require("./script.js"),
  require("./health.js"),
  require("./fixtures/data.js"),
  require("./dynamic-schema.js"),
  require("./locales.js"),
].concat(require("./schema.js"));
