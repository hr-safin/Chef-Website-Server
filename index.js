const express = require("express")
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors")
const port = process.env.PORT || 5000
require("dotenv").config();
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");



// middleware

app.use(express.json())
app.use(cors())
app.use(cookieParser())

// MIteLQtSZzLutUmN

//middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  console.log("Token in middleware", token)
  if(!token){
    res.status(401).send({message : "unauthorized access"})
  }

  jwt.verify(token, process.env.DB_ACCESS_SECRET_TOKEN , (err, decoded) => {
    if(err){
      res.status(401).send({message : "unauthorized access"})
    }
    req.user = decoded
    next()
  } )
  
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tk2icnu.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();


    const foodCollection = client.db("foodsDB").collection("foods")
    const addFoodCollection = client.db("addFoodDB").collection("addFood")
    const purchaseCollection = client.db("purchaseDB").collection("purchase")

    //  food related ui

    app.get("/foods", async(req,res) => {

        const page = parseInt(req.query.page)
        const size = parseInt(req.query.size)
        const cursor = foodCollection.find().skip(page * size).limit(size)
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get("/seeFood/:id", async(req,res) => {
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await foodCollection.findOne(query)
        res.send(result)
    })


    // get top food

    app.get("/topFood/:id", async(req,res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await foodCollection.findOne(query)
      res.send(result)
    })


    app.get("/foodOrder/:id", async(req,res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      console.log(query)
      const result = await foodCollection.findOne(query)
      res.send(result)
    })


    // purchase related api

    
    app.post("/purchaseFood", async (req, res) => {
      try {
        const { foodName, foodPrice, foodImage, foodDescription, foodQuantity, buyerName, email } = req.body;
    
        // Increment the purchase count for the food item
        const filter = { foodName };
        const update = {
          $inc: { purchaseCount: 1 }
        };
    
        await foodCollection.updateOne(filter, update);
    
        // Create a new purchase record
        const purchaseData = {
          foodName,
          foodPrice,
          foodImage,
          foodDescription,
          foodQuantity,
          buyerName,
          email,
          date: new Date()
        };
    
        const purchaseResult = await purchaseCollection.insertOne(purchaseData);
    
        res.json({ message: "Purchase successful", result: purchaseResult });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app.get("/purchaseFood", async(req, res) => {
      const cursor = purchaseCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    

    app.get("/topSellingFoods", async (req, res) => {
      try {
        // Fetch all food items and sort them by purchase count in descending order
        const topSellingFoods = await foodCollection
          .find()
          .sort({ purchaseCount: -1 }) // Sort by purchaseCount in descending order
          .toArray();
    
        res.json(topSellingFoods);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // app.get("/purchaseFood",   async(req,res) => {
    //   // login owner
    //   console.log(req.query.email)
    //   console.log("cook cook", req.cookies)
    //   // token owner
    //   console.log("token owner", req.user.email)

    //   if(req.user.email !== req.query.email){
    //     res.status(403).send({message : "not authorized"})
    //   }
    //   let query = {}
    //   if(req.query?.email){
    //     query = {email : req.query.email}
    //   }

    //   const result = await purchaseCollection.find(query).toArray()
    //   res.send(result)
    // })

    app.delete("/purchaseFood/:id", async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await purchaseCollection.deleteOne(query)
      res.send(result)
    })


    

    
    app.post("/foodIds", async(req,res) => {
        const ids = req.body
        console.log(ids)
        const idsWithObjectId = ids.map(id => new ObjectId(id))
        const query = {
          id : {
            $in : idsWithObjectId
          }
        }
  
        console.log(idsWithObjectId)
        const result = await foodCollection.find(query).toArray()
        res.send(result)
      })



      // add food relate api

      app.post("/addFood", async(req,res) => {
        const foods = req.body
        const result = await foodCollection.insertOne(foods)
        res.send(result)
      })

      app.get("/addFood", async(req, res) => {
        const cursor = foodCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })
      


      
      // app.get("/addFood",   async(req,res) => {
      //   // login owner
      //   console.log(req.query.email)
      //   console.log("cook cook", req.cookies)
      //   // token owner
      //   console.log("token owner", req.user.email)
  
      //   if(req.user.email !== req.query.email){
      //     res.status(403).send({message : "not authorized"})
      //   }
      //   let query = {}
      //   if(req.query?.email){
      //     query = {email : req.query.email}
      //   }
  
      //   const result = await foodCollection.find(query).toArray()
      //   res.send(result)
      // })
  

      
      app.get("/update/:id", async(req, res) => {
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const result = await foodCollection.findOne(query)
        res.send(result)
      })

      // app.get("/update",  verifyToken, async(req,res) => {
      //   // login owner
      //   console.log(req.query.email)
      //   console.log("cook cook", req.cookies)
      //   // token owner
      //   console.log("token owner", req.user.email)
  
      //   if(req.user.email !== req.query.email){
      //     res.status(403).send({message : "not authorized"})
      //   }
      //   let query = {}
      //   if(req.query?.email){
      //     query = {email : req.query.email}
      //   }
  
      //   const result = await purchaseCollection.find(query).toArray()
      //   res.send(result)
      // })

      app.put("/update/:id", async(req,res) => {
        const id = req.params.id
        const product = req.body
        console.log(product)
        const filter = {_id : new ObjectId(id)}
        const options = { upsert: true };
        const updateProduct = {
          $set: {
            foodName : product.foodName,
            foodCategory : product.foodCategory,
            foodImage : product.foodImage,
            foodPrice : product.foodPrice,
            foodDescription : product.foodDescription,
            foodQuantity : product.foodQuantity,
            foodOrigin : product.foodOrigin,
            
            
          },
        };
        const result = await foodCollection.updateOne(filter, updateProduct, options);
        res.send(result)
      })
      




      // auth related jwt
        // token generate in localhost and we can get  data as well 
        // but after deploying the project token is not working 
      app.post("/jwt", async(req, res) =>{
        const user = req.body
       //  generate token
        const token = jwt.sign(user, process.env.DB_ACCESS_SECRET_TOKEN , {expiresIn : "3hr"})
 
 
        res
        .cookie("token", token, {
         httpOnly : true,
         secure : process.env.NODE_ENV === "production",
         sameSite : process.env.NODE_ENV === "production" ? "none" : "strict"
        })
        .send({success : true})
 
      })

      app.post("/logout", async(req, res) => {
        const user = req.body
        console.log("logged out", user  )
        res.clearCookie("token", {maxAge : 0}).send({success : true})
      })
  

      




    // pagination work

    app.get("/foodCount", async(req, res) => {
        const count = await foodCollection.estimatedDocumentCount()
        res.send({count})
    })










    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get("/", (req,res) => {
    res.send("Restaurant website is running")
})


app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})