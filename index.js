const express = require('express')
const app = express()
let cors = require('cors')
const dotenv=require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
// {
//   origin:['http://localhost:5173'],
//   credentials:true
// }
// name:Assignment-11-Server
// pass:Assignment-11-Server
app.use(cors());
app.use(express.json())
// console.log(process.env.DB_USER)

// const uri = "mongodb+srv://Assignment-11-Server:Assignment-11-Server@cluster0.dhtqvw7.mongodb.net/?retryWrites=true&w=majority";

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

    app.get('/blog', async(req, res) => {
      let quer = {}
      if (req.query.category) {
        quer = {category: req.query.category }
      }
      const cursor=blogCollection.find(quer)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/blog/:id', async(req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await blogCollection.findOne(query)
      res.send(result)
    })

    app.post('/wishlist',async(req,res)=>{
      const data=req.body
      const result=await wishlistCollection.insertOne(data)
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