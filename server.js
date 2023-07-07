const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data
const app = express()
const mongodb_uri = "mongodb+srv://gaorock530:MEIEozSlKAyLInXb@cluster0.wl32kqy.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongodb_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(cors())
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/rental_submit', upload.array(), async (req, res) => {
  console.log('[POST]', '/rental_submit')

  if (!req.body.id) return res.json({ error: 'id missing', status: 4000 })
  if (!req.body.phone) return res.json({ error: 'phone missing', status: 4001 })

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const rental_collection = client.db('wx_rental').collection("rental_requests")

    // check phone
    const phone = await rental_collection.findOne({ phone: req.body.phone })
    if (phone) return res.json({ error: 'phone already used', status: 4002 })

    const result = await rental_collection.insertOne({
      id: req.body.id,
      submit_date: Date.now(),
      community: req.body.community,
      name: req.body.name,
      phone: req.body.phone,
      usage: req.body.usage,
      status: 1 // 1-new request 2-answered 
    })

    res.json({ data: result, status: 200 })
  } catch (e) {
    res.json({ error: e.toString(), status: 500 })
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
})

// app.get('/', async (req, res) => {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     // await client.db("admin").command({ ping: 1 });
//     // console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     const database = client.db('wx_rental')
//     const rental_collection = database.collection("rental_requests")

//     await rental_collection.insertMany([
//       { "name": "apples", "qty": 5, "rating": 3 },
//       { "name": "bananas", "qty": 7, "rating": 1, "microsieverts": 0.1 },
//       { "name": "oranges", "qty": 6, "rating": 2 },
//       { "name": "avocados", "qty": 3, "rating": 5 },
//     ]);

//     res.json({data: 'ok', status: 200})
//   }catch(e) {
//     res.json({error: e.toString(), status: 500})
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// })


app.get('/:phone', async (req, res) => {
  console.log('[GET]', '/:phone')
  const phone = req.params.phone

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db('wx_rental')
    const rental_collection = database.collection("rental_requests")
    const findResult = await rental_collection.find({ phone });
    if (findResult) {
      res.json({ data: findResult, status: 200 })
    } else {
      res.json({ data: null, status: 200 })
    }
  } catch (e) {
    res.json({ error: e.toString(), status: 500 })
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
})

app.get('/status/:id', async (req, res) => {
  console.log('[GET]', '/status/:id')
  const id = req.params.id

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const rental_collection = client.db('wx_rental').collection("rental_requests")
    const findResult = await rental_collection.findOne({ id });
    if (findResult) {
      res.json({ data: findResult, status: 200 })
    } else {
      res.json({ data: null, status: 200 })
    }
  } catch (e) {
    res.json({ error: e.toString(), status: 500 })
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
})

app.get('/all', async (req, res) => {
  console.log('[GET]', '/all')
  res.json({ data: 'all', status: 200 })
})

app.get('*', (req, res) => {
  res.status(404)
})

app.listen(8080, err => console.log(err || 'Server running on PORT: 8080'))