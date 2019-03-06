function getMinWidths(variants) {
  return variants.map(variant => {
    return variant.minWidth;
  });
}

function getValidMinWidths(variants, width) {
  return getMinWidths(variants).filter(minWidth => {
    return width >= minWidth;
  });
}

function getVariantForWidth(variants, width) {
  const validMinWidths = getValidMinWidths(variants, width);

  // our minWidths are exclusive if we have more than one, only the widest valid one wins
  const widestValidMinWidth = validMinWidths.sort((a, b) => {
    return b - a;
  })[0];

  // return the first variant with widest valid minWidth
  return variants.find(variant => {
    return variant.minWidth === widestValidMinWidth;
  });
}

function getImageUrls(image, width) {
  return {
    image1x: getImageUrl(image, width, getFileExtension(image.key)),
    image2x: getImageUrl(image, width * 2, getFileExtension(image.key)),
    webp1x: getImageUrl(image, width, "webply"),
    webp2x: getImageUrl(image, width * 2, "webply")
  };
}

function getImageUrl(image, width, format) {
  if (process.env.IMAGE_SERVICE_URL) {
    return process.env.IMAGE_SERVICE_URL.replace("{key}", image.key)
      .replace("{width}", width)
      .replace("{format}", format);
  } else {
    return image.url;
  }
}

function getFileExtension(imageKey) {
  const fileExtensionPattern = /\.([0-9a-z]+$)/i;
  const fileExtension = imageKey.match(fileExtensionPattern);
  if (fileExtension && fileExtension[1] === "png") {
    return "png";
  }
  return "pjpg";
}

function getPaddingBottom(matchingVariants) {
  // paddingBottom is based on the image with the biggest aspectRatio
  // only the image variants matching the current width are taken into account
  let paddingBottom = 100;
  if (matchingVariants.length > 0) {
    const tallestImage = matchingVariants
      .slice()
      .sort((a, b) => {
        const aspectRatioA = (a.file.height / a.file.width) * 100;
        const aspectRationB = (b.file.height / b.file.width) * 100;
        return aspectRatioA - aspectRationB;
      })
      .pop();
    paddingBottom = (tallestImage.file.height / tallestImage.file.width) * 100;
  }
  return paddingBottom;
}

module.exports = {
  getImageUrls: getImageUrls,
  getVariantForWidth: getVariantForWidth,
  getPaddingBottom: getPaddingBottom
};
