const Boom = require("boom");
const UglifyJS = require("uglify-js");
const fs = require("fs");
const path = require("path");

const stylesDir = path.join(__dirname, "/../../styles/");
const styleHashMap = require(path.join(stylesDir, "hashMap.json"));
const viewsDir = path.join(__dirname, "/../../views/");
const getScript = require("../../helpers/renderingInfoScript.js").getScript;
const getExactPixelWidth = require("../../helpers/toolRuntimeConfig.js")
  .getExactPixelWidth;
const getImageUrls = require("../../helpers/images.js").getImageUrls;

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
  if (typeof payload.toolRuntimeConfig !== "object") {
    return next(Boom.badRequest(), payload);
  }
  await validateAgainstSchema(payload.item, options);
}

module.exports = {
  method: "POST",
  path: "/rendering-info/web",
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: validatePayload
    }
  },
  handler: async function(request, h) {
    const item = request.payload.item;
    item.id = request.query._id;

    const context = {
      item: item,
      displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
      id: `q_imageslider_${request.query._id}_${Math.floor(
        Math.random() * 100000
      )}`.replace(/-/g, ""),
      imageServiceUrl: process.env.IMAGE_SERVICE_URL
    };

    // if we have the width in toolRuntimeConfig.size
    // we can use it to set the resolution of the image
    const exactPixelWidth = getExactPixelWidth(
      request.payload.toolRuntimeConfig
    );

    if (Number.isInteger(exactPixelWidth)) {
      context.width = exactPixelWidth;
      item.images.map(image => {
        image.urls = getImageUrls(
          image.file.key,
          context.width,
          context.imageServiceUrl
        );
      });
    }

    const renderingInfo = {
      polyfills: ["Promise", "CustomEvent"],
      stylesheets: [
        {
          name: styleHashMap["default"]
        }
      ],
      scripts: [
        {
          content: UglifyJS.minify(
            getScript(context.id, context.item, context.imageServiceUrl)
          ).code
        }
      ],
      markup: nunjucksEnv.render(viewsDir + "imageslider.html", context)
    };

    return renderingInfo;
  }
};
