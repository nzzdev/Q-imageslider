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
  // undefined minWidths are set to 0
  // as they are valid as long as no defined one is wider than the given width
  variants = variants.map(variant => {
    if (variant.minWidth === undefined) {
      variant.minWidth = 0;
    }
    return variant;
  });

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

function getPaddingBottom(matchingVariants) {
  // paddingBottom is based on the image with the biggest aspectRatio
  // only the image variants matching the current width are taken into account
  const tallestImage = matchingVariants
    .slice()
    .sort((a, b) => {
      const aspectRatioA = (a.file.height / a.file.width) * 100;
      const aspectRationB = (b.file.height / b.file.width) * 100;
      return aspectRatioA - aspectRationB;
    })
    .pop();
  return (tallestImage.file.height / tallestImage.file.width) * 100;
}

module.exports = {
  getImageUrls: getImageUrls,
  getVariantForWidth: getVariantForWidth,
  getPaddingBottom: getPaddingBottom
};
