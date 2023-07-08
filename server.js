const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const multer = require('multer') // v1.0.5
const upload = multer() // for parsing multipart/form-data
const app = express()
const router = express.Router()
const mongodb_uri = "mongodb+srv://gaorock530:MEIEozSlKAyLInXb@cluster0.wl32kqy.mongodb.net/?retryWrites=true&w=majority";

const appid = 'wx77b0a2f41edb5837'
const AppSecret = '9e4977b7d7bf91575a07896e7801761b'

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(mongodb_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use('/api', router) // load the router on '/greet'
app.use(cors())
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

router.post('/rental_submit', upload.array(), async (req, res) => {
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


router.get('/phone/:phone', async (req, res) => {
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

router.get('/status/:id', async (req, res) => {
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

router.get('/wx_oauth_redirect', async (req, res) => {
  console.log('[GET]', '/wx_oauth_redirect')
  console.log(req.query)

  try {
    console.log('fetching access token...')
    const res = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${AppSecret}&code=${req.query.code}&grant_type=authorization_code`)
    const json = await res.json()
    console.log(json)
    console.log('fetch user info...')
    const userRes = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${json.access_token}&openid=${json.openid}&lang=zh_CN`)
    const userJson = await userRes.json()
    console.log(userJson)
    res.redirect(`https://wx.zhongchenggongsi.com/rental?openid=${userJson.openid}&name=${userJson.nickname}&img=${userJson.headimgurl}`)
  } catch (e) {
    const error = e.toString()
    console.log(error)
    res.redirect(`https://wx.zhongchenggongsi.com/rental?error=${error}`)
  }




})




router.all('*', (req, res) => {
  res.status(404)
})

app.listen(8080, err => console.log(err || 'Server running on PORT: 8080'))