const Lab = require("@hapi/lab");
const Code = require("@hapi/code");
const Hapi = require("@hapi/hapi");
const lab = (exports.lab = Lab.script());
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
process.env.IMAGE_SERVICE_URL =
  "https://q-images-stage.nzz.ch/{key}?width={width}&format={format}";

const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const it = lab.it;

const routes = require("../routes/routes.js");

let server;

before(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
    });
    await server.register(require("@hapi/inert"));
    server.validator(require("joi"));
    server.route(routes);
  } catch (err) {
    expect(err).to.not.exist();
  }
});

after(async () => {
  await server.stop({ timeout: 2000 });
  server = null;
});

function element(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelector(selector));
  });
}

function elementCount(markup, selector) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

lab.experiment("Q imageslider dom tests", () => {
  it("should display title", async () => {
    const response = await server.inject({
      url: "/rendering-info/web?_id=someid",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/three-images.json"),
        toolRuntimeConfig: {},
      },
    });

    return elementCount(response.result.markup, "h3.s-q-item__title").then(
      (value) => {
        expect(value).to.be.equal(1);
      }
    );
  });

  it("should display imageslider", async () => {
    const response = await server.inject({
      url: "/rendering-info/web",
      method: "POST",
      payload: {
        item: require("../resources/fixtures/data/three-images.json"),
        toolRuntimeConfig: {},
      },
    });

    return elementCount(
      response.result.markup,
      "div.q-imageslider-images"
    ).then((value) => {
      expect(value).to.be.equal(1);
    });
  });
});
