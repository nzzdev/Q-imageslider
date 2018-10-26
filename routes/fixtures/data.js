const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
// has to be in sync with files created in build task - see ../../tasks/build.js
const fixtureData = [
  require(`${fixtureDataDirectory}/two-images.json`),
  require(`${fixtureDataDirectory}/two-images-long-labels.json`),
  require(`${fixtureDataDirectory}/two-images-only-required-properties.json`),
  require(`${fixtureDataDirectory}/two-images-valid-invalid-source-links.json`),
  require(`${fixtureDataDirectory}/two-images-different-image-heights.json`),
  require(`${fixtureDataDirectory}/two-images-size-variants.json`),
  require(`${fixtureDataDirectory}/two-images-size-variants-all-minWidth-0.json`),
  require(`${fixtureDataDirectory}/three-images.json`),
  require(`${fixtureDataDirectory}/three-images-long-labels.json`),
  require(`${fixtureDataDirectory}/three-images-only-required-properties.json`),
  require(`${fixtureDataDirectory}/five-images.json`),
  require(`${fixtureDataDirectory}/five-images-long-labels.json`),
  require(`${fixtureDataDirectory}/ten-images.json`),
  require(`${fixtureDataDirectory}/ten-images-long-labels.json`)
];

module.exports = {
  path: "/fixtures/data",
  method: "GET",
  options: {
    tags: ["api"],
    cors: true
  },
  handler: (request, h) => {
    return fixtureData;
  }
};
