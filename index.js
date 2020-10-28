// Load .env file
require('dotenv').config();

// Load required libraries from node_modules
const express = require('express')
const hbs = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// Configure the environment
const PORT = parseInt(process.env.PORT) || 3000

// Create an instance of the express application
const app = express()

// configure handlebars to manage views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }))
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

// configure the static files
app.use(
  express.static(__dirname + '/static')
  )

// prefix match
  // LANDING PAGE
  app.get(['/', '/index.html'], (req, resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
  })

  const ENDPOINT = 'https://api.giphy.com/v1/gifs/search'

  app.get('/search', async (req, resp) => {
    const search = req.query['keyword']
    console.log('search term: ', search)
    const url = withQuery(
      ENDPOINT,
      {
        api_key: process.env.GIPHY_API_KEY,
        q: search,
        limit: 15,
        rating: 'r',
        lang: 'en'
      }
      )
    const results = await fetch(url)
    const gifs = await results.json()
    const gifsImgArr = []
    gifs.data.forEach((e) => {
      gifsImgArr.push({
        img: e.images.fixed_height.url,
        url: e.url})
    })
    if (gifsImgArr.length > 0) {
      resp.status(200)
      resp.render('search', {
        gifsImgArr: gifsImgArr,
        keyword: search
      })
    } else {
      resp.status(204)
      resp.render('no_result',{
        keyword: search
      })
    }
  })

// Start express
if (process.env.GIPHY_API_KEY) {
  app.listen(PORT, () => { // first parameter = port number
    console.log(`Application started on port ${PORT} at ${new Date()}`)
    console.log('Giphy API Key: ', process.env.GIPHY_API_KEY)
  })
} else {
  console.error('API Key is not set')
}
