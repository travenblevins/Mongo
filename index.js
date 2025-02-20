const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// using mongoose to connect to mongodb
const mongoose = require('mongoose');
const db_uri = process.env.DB_URI || 'mongodb://localhost:27017/';
mongoose.connect(db_uri);
const db = mongoose.connection;

db.on('error', (err) => {
    console.error(err);
})
db.once('open', () => {
    console.log('Database connected');
})

// define a schema for  collection using mongoose
const User = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true }
});

const userModel = mongoose.model('userList', User);

// create a new user
app.post('/users', async (req, res) => {
    const user = new userModel(req.body);
    try {
        await user.save();
        const result = await userModel.find();
        res.send(result);
    } catch (err) {
        res.status(500).send
    }
})

// get all users
app.get('/users', async (req, res) => {
    try {
        const users = await userModel.find();
        res.send(users);
    } catch (err) {
        res.status(500).send(err);
    }
})

// get a user
app.get('/users/:name', async (req, res) => {
    const name = req.params.name;
    try {
        const users = await UserModel.find({ name: name });
        res.send(users);
    } catch (err) {
        res.status(500).send(err);
    }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

// edit an existing user
app.put('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userModel.findOneAndUpdate(
            { userId: userId },
            req.body,
            { new: true } // Return the updated document
        );

        if (user) {
            res.send(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(500).send('Error updating user');
    }
})

// Search for a user by name (firstName or lastName)
app.get('/users/search/:name', async (req, res) => {
    const name = req.params.name;
    try {
        const user = await userModel.findOne({
            $or: [
                { firstName: { $regex: name, $options: 'i' } }, // Case-insensitive match for firstName
                { lastName: { $regex: name, $options: 'i' } }   // Case-insensitive match for lastName
            ]
        });

        if (user) {
            res.send(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        res.status(500).send('Error searching for user');
    }
});

// Sort users by firstName in ascending order
app.get('/users/sort/asc', async (req, res) => {
    try {
        const users = await userModel.find().sort({ firstName: 1 }); // 1 for ascending
        res.json(users);
    } catch (err) {
        res.status(500).send('Error sorting users in ascending order');
    }
});

// Sort users by firstName in descending order
app.get('/users/sort/desc', async (req, res) => {
    try {
        const users = await userModel.find().sort({ firstName: -1 }); // -1 for descending
        res.json(users);
    } catch (err) {
        res.status(500).send('Error sorting users in descending order');
    }
});


