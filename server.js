const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.json({data: '', status: 200})
})

app.listen(8080, err =>console.log( err || 'Server running on PORT: 8080'))