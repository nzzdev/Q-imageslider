const fs = require('fs')
const Lab = require('lab')
const Code = require('code')
const Hapi = require('hapi')
const lab = exports.lab = Lab.script()

const expect = Code.expect
const before = lab.before
const after = lab.after
const it = lab.it

const routes = require('../routes/routes.js')

let server

before(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
      routes: {
        cors: true
      }
    })
    await server.register(require('inert'))
    server.route(routes)
  } catch (err) {
    expect(err).to.not.exist()
  }
})

after(async () => {
  await server.stop({ timeout: 2000 })
  server = null
})

lab.experiment('basic routes', () => {
  it('starts the server', () => {
    expect(server.info.created).to.be.a.number()
  })

  it('is healthy', async () => {
    const response = await server.inject('/health')
    expect(response.payload).to.equal('ok')
  })
})

lab.experiment('rendering-info', () => {
  const fixture = JSON.parse(fs.readFileSync(`${__dirname}/../resources/fixtures/data/two-images.json`, { encoding: 'utf-8' }))

  it('returns 200 for /rendering-info/web', async () => {
    const request = {
      method: 'POST',
      url: '/rendering-info/web',
      payload: {
        item: fixture,
        toolRuntimeConfig: {
          displayOptions: {

          }
        }
      }
    }
    const response = await server.inject(request)
    expect(response.statusCode).to.be.equal(200)
  })
})
