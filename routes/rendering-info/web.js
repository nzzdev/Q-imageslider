const Boom = require('boom')
const fs = require('fs')
const path = require('path')

const stylesDir = path.join(__dirname, '/../../styles/')
const styleHashMap = require(path.join(stylesDir, 'hashMap.json'))
const viewsDir = path.join(__dirname, '/../../views/')

// setup nunjucks environment
const nunjucks = require('nunjucks')
const nunjucksEnv = new nunjucks.Environment()

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(fs.readFileSync(path.join(__dirname, '../../resources/', 'schema.json'), {
  encoding: 'utf-8'
}))
const Ajv = require('ajv')
const ajv = new Ajv()

// add draft-04 support explicit
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))

const validate = ajv.compile(schemaString)
function validateAgainstSchema (item, options) {
  if (validate(item)) {
    return item
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors))
  }
}

async function validatePayload (payload, options, next) {
  if (typeof payload !== 'object') {
    return next(Boom.badRequest(), payload)
  }
  if (typeof payload.item !== 'object') {
    return next(Boom.badRequest(), payload)
  }
  if (typeof payload.toolRuntimeConfig !== 'object') {
    return next(Boom.badRequest(), payload)
  }
  await validateAgainstSchema(payload.item, options)
}

module.exports = {
  method: 'POST',
  path: '/rendering-info/web',
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: validatePayload
    }
  },
  handler: async function (request, h) {
    const item = request.payload.item

    const context = {
      item: item,
      displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
      id: `q_imageslider_${request.query._id}_${Math.floor(Math.random() * 100000)}`.replace(/-/g, '')
    }

    const renderingInfo = {
      polyfills: ['Promise'],
      stylesheets: [
        {
          name: styleHashMap['default']
        }
      ],
      scripts: [
        {
          content: `
          function ${context.id}_initImageslider() {
            var sliderSwitch = document.querySelector(".q-imageslider-switch");
            var sliderImages = document.querySelectorAll(".q-imageslider-image");
            sliderSwitch.addEventListener("change", function() {
                if(this.checked) {
                    sliderImages[0].classList.add("q-imageslider-image--is-hidden");
                    sliderImages[0].classList.remove("q-imageslider-image--is-visible");
                    sliderImages[1].classList.add("q-imageslider-image--is-visible");
                    sliderImages[1].classList.remove("q-imageslider-image--is-hidden");
                } else {
                    sliderImages[0].classList.add("q-imageslider-image--is-visible");
                    sliderImages[0].classList.remove("q-imageslider-image--is-hidden");
                    sliderImages[1].classList.add("q-imageslider-image--is-hidden");
                    sliderImages[1].classList.remove("q-imageslider-image--is-visible");
                }
            })
          };
          ${context.id}_initImageslider();
          `
        }
      ],
      markup: nunjucksEnv.render(viewsDir + 'imageslider.html', context)
    }

    return renderingInfo
  }
}
