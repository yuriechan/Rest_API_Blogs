const express = require('express')
const bodyParser = require('body-parser')
const router = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const server = app.listen(port)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))
app.use('/', router)
app.use((err, req, res, next) => {
    logger.error(err.stack);
    setTimeout(() => {
      if (!res.headersSent) {
        res.status(500).send('Something broke!');
      }
    }, 100);
  });

console.log(`Server started on port ${port}...`)

module.exports = server