const express = require('express')
const app = express()
let cors = require('cors')
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken');
let cookieparser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
// {
//   origin:['http://localhost:5173'],
//   credentials:true
// }
app.use(cors( {
    origin:['http://localhost:5173'],
    credentials:true
  }));
app.use(express.json());
app.use(cookieparser())

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log("value of token ", token)
  if (!token) {
    return res.status(401).send({ message: 'not authorigation' })
  }
  jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
    // error
    if (err) {
      return res.status(401).send({ message: 'not authorigation' })
    }
    // decoded
    console.log('value of', decoded)
    req.user = decoded
    next()

  })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhtqvw7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const blogCollection = client.db("blog").collection("allblogs");
    const wishlistCollection = client.db("blog").collection("wishlist");
    // const bookingCollectio = client.db("blog").collection("bookings");

    app.post('/blog', async (req, res) => {
      const document = {
        ...req.body,
        currentTime: new Date(),
      };
      const result = await blogCollection.insertOne(document)
      res.send(result)
    })

    app.get('/blog', async (req, res) => {
      let quer = {}
      if (req.query.category) {
        quer = { category: req.query.category }
      }
      const cursor = blogCollection.find(quer)
      const result = await cursor.toArray()
      res.send(result)
    })

    // app.get('/blog/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }
    //   const result = await blogCollection.findOne(query)
    //   res.send(result)
    // })

    app.get('/wishlist/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await wishlistCollection.findOne(query)
      res.send(result)
    })

    app.post('/wishlist', async (req, res) => {
      const data = req.body
      const result = await wishlistCollection.insertOne(data)
      res.send(result)
    })

    app.post("/jwt",async(req,res)=>{
      const data=req.body
      const token=jwt.sign(data, process.env.JWT_TOKEN, {expiresIn: '1h'});
      res
      .cookie('token',token,{
        httpOnly:true,
        secure:false,
        sameSite:'strict',
      })
      .send({success:true})
    })

     app.delete('/wishlist/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await wishlistCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/wishlist',verifyToken,async(req,res)=>{
      let quer={}
      console.log('user:', req.user)
      if(req.query?.email !== req.query?.email){
        return res.status(404).send({message:'not accis'})
      }
      if(req.query.email){
        quer={email: req.query.email}
      }
      const cursor=wishlistCollection.find(quer)
      const result=await cursor.toArray()
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})