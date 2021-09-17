const Boom = require("@hapi/boom");
const Joi = require("joi");

function getStartImageEnum(item) {
  if (item.images.length < 2) {
    return [0];
  }
  // constructs an array like [0,1,2,3,...] with as many indexes as there are images
  return [].concat(
    Array.from(new Array(item.images.length), (val, index) => index)
  );
}

function getStartImageEnumTitles(item) {
  if (item.images.length < 2) {
    return ["1. Bild"];
  }

  return item.images.map((image, index) => {
    if (image.label) {
      return image.label;
    }
    return `${index + 1}. Bild`;
  });
}

module.exports = {
  method: "POST",
  path: "/dynamic-enum/{optionName}",
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request, h) {
    const item = request.payload.item;
    if (request.params.optionName === "startImage") {
      return {
        enum: getStartImageEnum(item),
        enum_titles: getStartImageEnumTitles(item),
      };
    }

    return Boom.badRequest();
  },
};
