const express = require('express')
const cors = require ('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.52cv5mu.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run(){
    try{
 await client.connect();

 const db = client.db('smart_db')
 const productsCollection = db.collection('products')
 const bidsCollection = db.collection('bids')
 const userCollection = db.collection('users')
 

//  user apis

 app.post('/users',async(req,res)=>{
    const newUser = req.body
    const email = req.body.email
    const query = {email:email}
    const exitingUser = await userCollection.findOne(query)
    if(exitingUser){
        res.send('user already have. do not need to add')
    }
    else{
const result = await userCollection.insertOne(newUser)
    res.send(result)
    }
    
 })

//  products api
 app.get('/products',async(req,res)=>{
  
//     const cursor = productsCollection.find().sort({
// price_min:-1}).limit(2)
console.log(req.query)
const email = req.query.email
const query = {}
if(email){
    query.email=email
}
const cursor = productsCollection.find(query)
    const result = await cursor.toArray()
    res.send(result)
 })
  
 app.get('/products/:id',async(req,res)=>{
    const id = req.params.id
    const query = {_id:new ObjectId(id)}
    const result = await productsCollection.findOne(query)
    res.send(result)
 })
 app.post('/products',async(req,res)=>{
    const newProduct = req.body
    const result = await productsCollection.insertOne(newProduct)
    res.send(result)
})

app.patch('/products/:id',async(req,res)=>{
    const id = req.params.id
    const updatedProducts = req.body
    const query = {_id:new ObjectId(id)}
    const update = {
        $set:{
            name:updatedProducts.name,
            price:updatedProducts.price
        }
    }

    const options = {}
    const result = await productsCollection.updateOne(query,update,options)
    res.send(result)
})
app.delete('/products/:id',async(req,res)=>{
    const id = req.params.id
    const query = {_id:new ObjectId(id)}
    const result = await productsCollection.deleteOne(query)
    res.send(result)
})



app.get('/latest-products',async(req,res)=>{
    const cursor = productsCollection.find().sort({created_at:-1}).limit(6) 
    const result = await cursor.toArray()
    res.send(result)
})
// bids related api

app.get('/bids',async(req,res)=>{
    const email = req.query.email
    const query={}
    if(email){
        query.buyer_email=email
    } 
    const cursor = bidsCollection.find(query)
    const result = await cursor.toArray()
    res.send(result)
})
app.get('/bids',async(req,res)=>{
    const query = {}
    if(query.email){
        query.buyer_email=email
    }
    const cursor = bidsCollection.find(query)
    const result = await cursor.toArray()
    res.send(result)
})
app.get('/products/bids/:productId',async(req,res)=>{
    const productId = req.params.productId;
    const query = {product:productId}
    const cursor = bidsCollection.find(query).sort({
bid_price:1})
    const result = await cursor.toArray()
    res.send(result)
})
app.post('/bids',async(req,res)=>{
    const newBid = req.body;
    const result = await bidsCollection.insertOne(newBid)
    res.send(result)
})
 await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally{

    }
}
run().catch(console.dir) 

app.get('/',(req,res)=>{
    res.send('smart server is running')
})

app.listen(port,()=>{
    console.log(`smart server is running on port:${port}`)
})