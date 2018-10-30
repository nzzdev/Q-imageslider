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
      )}`.replace(/-/g, "")
    };

    // if we have the width in toolRuntimeConfig.size
    // we can use it to set the resolution of the image
    const exactPixelWidth = getExactPixelWidth(
      request.payload.toolRuntimeConfig
    );

    // compute some properties for the inline script to be returned that handles requesting the images for the measured width
    let requestMethod;
    let requestBodyString;
    const queryParams = {};

    if (typeof exactPixelWidth === "number") {
      const imagesResponse = await request.server.inject({
        method: "POST",
        url: `/rendering-info/web-images?width=${exactPixelWidth}`,
        payload: request.payload
      });
      context.imagesMarkup = imagesResponse.result.markup;
    } else {
      // add the item id to appendItemToPayload if it's state is in the db (aka not preview)
      if (request.payload.itemStateInDb) {
        queryParams.appendItemToPayload = request.query._id;
      }

      // if we have the current item state in DB, we do a GET request, otherwise POST with the item in the payload
      if (request.payload.itemStateInDb === true) {
        requestMethod = "GET";
        queryParams.appendItemToPayload = request.query._id;
      } else {
        requestMethod = "POST";
        queryParams.noCache = true; // set this if we do not have item state in DB as it will probably change
        requestBodyString = JSON.stringify({
          item: request.payload.item,
          toolRuntimeConfig: request.payload.toolRuntimeConfig
        });
      }
    }

    const renderingInfo = {
      polyfills: ["Promise", "CustomEvent", "fetch"],
      stylesheets: [
        {
          name: styleHashMap["default"]
        }
      ],
      scripts: [
        {
          content: UglifyJS.minify(
            getScript(
              context.id,
              request.payload.toolRuntimeConfig.toolBaseUrl,
              context.item,
              requestMethod,
              queryParams,
              requestBodyString
            )
          ).code
        }
      ],
      markup: nunjucksEnv.render(viewsDir + "imageslider.html", context)
    };

    return renderingInfo;
  }
};
