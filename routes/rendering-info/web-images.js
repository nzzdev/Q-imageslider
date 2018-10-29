const Boom = require("boom");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");

const viewsDir = path.join(__dirname, "/../../views/");

const imageHelpers = require("../../helpers/images.js");

// setup nunjucks environment
const nunjucks = require("nunjucks");
const nunjucksEnv = new nunjucks.Environment();

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../resources/", "schema.json"), {
    encoding: "utf-8"
  })
);
const Ajv = require("ajv");
const ajv = new Ajv();

// add draft-04 support explicit
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));

const validate = ajv.compile(schemaString);
function validateAgainstSchema(item, options) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

async function validatePayload(payload, options, next) {
  if (typeof payload !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.item !== "object") {
    return next(Boom.badRequest(), payload);
  }
  await validateAgainstSchema(payload.item, options);
}

module.exports = {
  method: "POST",
  path: "/rendering-info/web-images",
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      query: {
        width: Joi.number().required(),
        noCache: Joi.boolean(),
        toolRuntimeConfig: Joi.object().optional()
      },
      payload: validatePayload
    }
  },
  handler: async function(request, h) {
    const item = request.payload.item;
    const matchingVariants = [];
    for (let image of item.images) {
      // puts top level image with minWidth 0 to the beginning of the variants array
      let variants = [];
      if (image.variants) {
        variants = image.variants;
      }
      variants.unshift({
        minWidth: 0,
        file: image.file
      });

      // gets the matching variant based on the width
      const variant = imageHelpers.getVariantForWidth(
        variants,
        request.query.width
      );

      // collect all matchingVariants to calculate the paddingBottom value
      matchingVariants.push(variant);

      // gets the necessary url strings to build the picture element
      image.urls = imageHelpers.getImageUrls(
        variant.file.key,
        request.query.width
      );
    }

    const context = {
      item: item,
      startImage: item.images[item.options.startImage],
      paddingBottom: imageHelpers.getPaddingBottom(matchingVariants)
    };

    let markup;
    try {
      markup = nunjucksEnv.render(viewsDir + "images.html", context);
    } catch (e) {
      console.error(e);
      throw e;
    }

    const renderingInfo = {
      markup: markup
    };

    return renderingInfo;
  }
};