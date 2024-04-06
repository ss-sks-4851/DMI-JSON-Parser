const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const cors = require('cors');

require('dotenv').config();
const app = express();
app.use(bodyParser.json());

app.use(cors());

const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

// MongoDB connection URI
const uri = `mongodb+srv://${username}:${password}@cluster0.zlh8xzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const storage = multer.memoryStorage(); // Store files in memory, you can change it as per your requirement
const upload = multer({ storage: storage });
function customJSONParse(jsonString) {
    let index = 0;

    function skipWhitespace() {
        while (/\s/.test(jsonString[index])) {
            index++;
        }
    }

    function parseValue() {
        skipWhitespace();

        const char = jsonString[index];

        if (char === '{') {
            return parseObject();
        } else if (char === '[') {
            return parseArray();
        } else if (char === '"') {
            return parseString();
        } else if (char === '-' || (char >= '0' && char <= '9')) {
            return parseNumber();
        } else if (char === 't' || char === 'f' || char === 'n') {
            return parseBooleanOrNull();
        } else {
            throw new Error('Unexpected character: ' + char);
        }
    }

    function parseObject() {
        const obj = {};
        index++; // Skip the '{'
        while (jsonString[index] !== '}') {
            skipWhitespace();
            const key = parseString();
            skipWhitespace();
            if (jsonString[index] !== ':') {
                throw new Error('Expected ":" after key in object');
            }
            index++; // Skip the ':'
            skipWhitespace();
            const value = parseValue();
            obj[key] = value;
            skipWhitespace();
            if (jsonString[index] === ',') {
                index++; // Skip the ','
            } else if (jsonString[index] !== '}') {
                throw new Error('Expected "," or "}" after value in object');
            }
        }
        index++; // Skip the '}'
        return obj;
    }

    function parseArray() {
        const arr = [];
        index++; // Skip the '['
        while (jsonString[index] !== ']') {
            skipWhitespace();
            const value = parseValue();
            arr.push(value);
            skipWhitespace();
            if (jsonString[index] === ',') {
                index++; // Skip the ','
            } else if (jsonString[index] !== ']') {
                throw new Error('Expected "," or "]" after value in array');
            }
        }
        index++; // Skip the ']'
        return arr;
    }

    function parseString() {
        let start = ++index;
        while (jsonString[index] !== '"') {
            index++;
        }
        const str = jsonString.slice(start, index);
        index++; // Skip the '"'
        return str;
    }

    function parseNumber() {
        let start = index;
        while ((jsonString[index] >= '0' && jsonString[index] <= '9') || jsonString[index] === '.' || jsonString[index] === '-') {
            index++;
        }
        const num = parseFloat(jsonString.slice(start, index));
        return num;
    }

    function parseBooleanOrNull() {
        if (jsonString.slice(index, index + 4) === 'true') {
            index += 4;
            return true;
        } else if (jsonString.slice(index, index + 5) === 'false') {
            index += 5;
            return false;
        } else if (jsonString.slice(index, index + 4) === 'null') {
            index += 4;
            return null;
        } else {
            throw new Error('Unexpected token: ' + jsonString.slice(index, index + 5));
        }
    }

    try {
        const result = parseValue();
        skipWhitespace();
        if (index !== jsonString.length) {
            throw new Error('Unexpected characters after JSON content');
        }
        return result;
    } catch (error) {
        console.error('Error parsing JSON:', error.message);
        return null;
    }
}

async function connectToDatabase(dataToInsert) {
    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        // Use the database
        const database = client.db('json-parser');
        const collection = database.collection('json-parse');

        // Example: Insert data into the collection
        const result = await collection.insertOne(dataToInsert);
        console.log("result: "+result);
        console.log(`Inserted document into the collection`);
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    } finally {
        // Close the connection
        await client.close();
    }
}

// async function fetchDataFromDatabase() {
//     try {
//         // Connect to the MongoDB server
//         await client.connect();
//         console.log('Connected to MongoDB Atlas');

//         // Use the database
//         const database = client.db('json-parser');
//         const collection = database.collection('json-parse');

//         // Fetch data from the collection
//         const cursor = collection.find({});

//         // Iterate over the cursor and log the documents
//         await cursor.forEach(document => {
//             console.log(document);
//         });
//     } catch (error) {
//         console.error('Error fetching data from MongoDB Atlas:', error);
//     } finally {
//         // Close the connection
//         await client.close();
//     }
// }


// app.get("/",(req,res)=>{
//     console.log("server called!");
//     res.status(200).send("server called!");
// });

app.post('/parse', upload.single('file'),async  (req, res) => {
    console.log("JSON parser called!");

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    //Access the uploaded file via req.file
    const fileData = req.file;

    const jsonString = fileData.buffer.toString('utf8');

    if (!jsonString) {
        return res.status(400).json({ error: 'JSON string is required' });
    }

    const processedJsonString = jsonString.replace(/ {4}|[\t\n\r]/gm,'');
    
    try {
        const parsedJSON = await customJSONParse(processedJsonString);
        console.log(typeof parsedJSON);
        connectToDatabase(parsedJSON);
        //res.status(200).json({parsedJson:parsedJSON});
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: 'Invalid JSON string' });
    }
});

// app.get("/fetch-data",(req,res)=>{
//     fetchDataFromDatabase();
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
