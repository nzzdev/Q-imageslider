function getImageUrlForWidthAndFormat(imageKey, width, format) {
  return process.env.IMAGE_SERVICE_URL.replace("{key}", imageKey)
    .replace("{width}", width)
    .replace("{format}", format);
}

function getUrlsForImageAndWidth(imageKey, width) {
  return {
    png1x: getImageUrlForWidthAndFormat(imageKey, width, "png"),
    png2x: getImageUrlForWidthAndFormat(imageKey, width * 2, "png"),
    webp1x: getImageUrlForWidthAndFormat(imageKey, width, "webpll"),
    webp2x: getImageUrlForWidthAndFormat(imageKey, width * 2, "webpll")
  };
}

module.exports = {
  getUrlsForImageAndWidth: getUrlsForImageAndWidth
};
