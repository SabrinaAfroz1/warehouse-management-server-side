const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split('')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        console.log('decoded', decoded);
    })
    console.log('inside verifyJWT', authHeader);
    next();

}





const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_WORD}@cluster0.h16cz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





//function for data find from document(db)
async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('assignment11').collection('item');
        const itemCollection1 = client.db('assignment11').collection('myitem');


        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        //show all data-----------------------------
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/myitem', async (req, res) => {
            const query = {};
            const cursor = itemCollection1.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/myitem/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const item = await itemCollection1.findOne(query);
            res.send(item);

        })

        //show single data---------------------------
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);

        })

        //post---------------------------
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const result = await itemCollection.insertOne(newItem);
            res.send(result);

        })


        app.post('/myitem', async (req, res) => {
            const newItem = req.body;
            const result = await itemCollection1.insertOne(newItem);
            res.send(result);

        })


        //delete----------------------
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        })

        //update-----------------------
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateItem.newquantity,
                }
            }
            const result = await itemCollection.updateOne(filter, updateDoc,
                options
            );
            res.send(result);
        });





        // //show in order history-----
        // app.get('/manage', verifyJWT, async (req, res) => {

        //     const email = req.query.email;
        //     const query = { email: email };
        //     const cursor = orderCollection.find(query);
        //     const orders = await cursor.toArray();
        //     res.send(orders);
        // })


    }
    finally {

    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('running');
});

app.listen(port, () => {
    console.log('listening to port');
});