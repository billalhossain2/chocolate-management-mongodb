const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const env = require("dotenv");
env.config();
const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 9000;

app.get("/", (req, res) => {
  res.send(`Chocolate management server is running on port ${port}`);
});

const uri = process.env.MONGODB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const chocolateDB = client.db("chocolateDB");
    const chocolateCollection = chocolateDB.collection("chocolates");

    //create a new document to chocolateCollection
    app.post("/chocolate", async (req, res) => {
      const chocolate = req.body;
      const result = await chocolateCollection.insertOne(chocolate)
      res.send(result)
    });

    //get all documents from DB
    app.get("/chocolates", async(req, res)=>{
        const result = await chocolateCollection.find({}).toArray();
        res.send(result)
    })

    //get a single document from DB
    app.get("/chocolate/:chocolateId", async(req, res)=>{
        const chocolateId = req.params.chocolateId;
        const query = {"_id": new ObjectId(chocolateId)}
        const chocolate = await chocolateCollection.findOne(query)
        res.send(chocolate)
    })

    //delete a document from DB
    app.delete("/chocolate/:chocolateId", async(req, res)=>{
        const chocolateId = req.params.chocolateId;
        const query = {"_id":new ObjectId(chocolateId)}
        const result = await chocolateCollection.deleteOne(query)
        res.send(result)
    })

    //delete all documents
    app.delete("/chocolates/:deleteAll", async(req, res)=>{
        const result = await chocolateCollection.deleteMany({});
        res.send(result)
    })

    //update a document in DB
    app.put("/chocolate/:chocolateId", async(req, res)=>{
        const chocolateId = req.params.chocolateId;
        const chocolateData = req.body;
        const filter = {"_id":new ObjectId(chocolateId)};
        const updateDoc = {$set:chocolateData}
        const options = { upsert: true };
        const result = await chocolateCollection.updateOne(filter, updateDoc, options)
        res.send(result)
    })

  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Chocolate management server is running on port ${port}`);
});
