function getImageUrls(imageKey, width) {
  return {
    image1x: getImageUrl(imageKey, width, getFileExtension(imageKey)),
    image2x: getImageUrl(imageKey, width * 2, getFileExtension(imageKey)),
    webp1x: getImageUrl(imageKey, width, "webply"),
    webp2x: getImageUrl(imageKey, width * 2, "webply")
  };
}

function getImageUrl(imageKey, width, format) {
  return process.env.IMAGE_SERVICE_URL.replace("{key}", imageKey)
    .replace("{width}", width)
    .replace("{format}", format);
}

function getFileExtension(imageKey) {
  const fileExtensionPattern = /\.([0-9a-z]+$)/i;
  const fileExtension = imageKey.match(fileExtensionPattern);
  if (fileExtension && fileExtension[1] === "png") {
    return "png";
  }
  return "pjpg";
}

module.exports = {
  getImageUrls: getImageUrls
};
