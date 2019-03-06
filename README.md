# Q Imageslider [![Build Status](https://travis-ci.com/nzzdev/Q-imageslider.svg?token=tYv1sxPNiVKviBpSHziC&branch=dev)](https://travis-ci.com/nzzdev/Q-imageslider) [![Greenkeeper badge](https://badges.greenkeeper.io/nzzdev/Q-imageslider.svg?token=c13e57507403fee0c64955a752faf93fdcb6f5b553ec0165e3ed886447a411b9&ts=1551342785963)](https://greenkeeper.io/)

**Maintainer**: [manuelroth](https://github.com/manuelroth)

Q Imageslider is one tool of the Q toolbox to compare images with eachother.
Test it in the [demo](https://editor.q.tools).

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Functionality](#functionality)
- [License](#license)

## Installation

```bash
git clone git@github.com:nzzdev/Q-imageslider.git
cd Q-imageslider
nvm use
npm install
npm run build
```

## Configuration

There is one env variable `IMAGE_SERVICE_URL` to be defined. It should contain a URL with 3 parameters that will get replaced before the URL is used to load the images.
`{key}` will be replaced by the string Q-server stored as the key when the file got uploaded through Q-servers `/file` endpoint provided by the [file plugin](https://github.com/nzzdev/Q-server/blob/dev/plugins/file/index.js)
`{width}` is replaced by the width the image should be loaded
`{format}` will be `png` or `webp` (a `picture` element is used in the HTML with multiple `source` elements)
Example: `https://q-images.nzz.ch/{key}?width={width}&format={format}`

If `IMAGE_SERVICE_URL` is not configured, the `image.url` property is used directly to load the image. This is mostly useful for dev and testing with fixture data. On production you most certainly want to use an image service to deliver resized and optimized images to the users.

## Development

Start the Q dev server:

```
npx @nzz/q-cli server
```

Run the Q tool:

```
node index.js
```

[to the top](#table-of-contents)

## Testing

The testing framework used in this repository is [Code](https://github.com/hapijs/code).

Run the tests:

```
npm run test
```

### Implementing a new test

When changing or implementing...

- A `route`, it needs to be tested in the `e2e-tests.js` file
- Something on the frontend, it needs to be tested in the `dom-tests.js` file

[to the top](#table-of-contents)

## Deployment

We provide automatically built docker images at https://hub.docker.com/r/nzzonline/q-imageslider/.
There are three options for deployment:

- Use the provided images
- Build your own docker images
- Deploy the service using another technology

### Use the provided docker images

1. Deploy `nzzonline/q-imageslider` to a docker environment
2. Set the ENV variables as described in the [configuration section](#configuration)

## Functionality

The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

There are 2 endpoints for renderingInfo:

### `/rendering-info/web`

This is the default endpoint called for web targets. It returnes the complete markup including a picture element for the image in case an exact width is given in `toolRuntimeConfig.size.width`. In case the width is missing a script measuring the width after the dom is ready is returned. This script will call `/rendering-info/web-images` with the exact container width passed in the `width` query parameter.

### `/rendering-info/web-images`

There are 2 places where this route is called from.

1. From inside the handler for `rendering-info/web` using server.inject
2. From the client side script returned from `/rendering-info/web` if no exact width is given

This route handler renders the `view/images.html` template and returns a `<picture>` element containing different `<source>` elements for the image in different sizes for different screen DPI and png/webp.

[to the top](#table-of-contents)

### Options

#### startImage

This is a `dynamicEnum` and stores the index of the image to be shown initially. You can select something here to not start with the first image when the imageslider gets loaded.

#### displayOptions

##### hideTitle

If checked, the title is not rendered.

[to the top](#table-of-contents)

## LICENSE

Copyright (c) 2019 Neue Zürcher Zeitung.

This software is licensed under the [MIT](LICENSE) License.
