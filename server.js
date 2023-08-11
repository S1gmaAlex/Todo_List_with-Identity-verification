const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const Routes = require('./routes/Routes');
const { requireAuth, checkUser } = require('./middleware/AuthMW');

const app = express();
dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(Routes);

//connect db
mongoose.connect(process.env.MONGODB_URL)
    .then(() =>
        console.log("Connected To MongoDB")
    )
    .catch((err) => {
        console.log(err);
    })

app.listen(5000, () => {
    console.log(`server is running at http://localhost:${5000}`)
})
//routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/todo', requireAuth, (req, res) => res.render('todo'));

// cookies
// app.get('/set-cookies', (req, res) => {
//     // res.setHeader('Set-Cookie', 'newUser = true');
//     res.cookie('newUser', false);
//     res.cookie('newAdmin', true, { maxAge: 1000 });
//     res.send('you got the cookies!')
// });

// app.get('/read-cookies', (req, res) => {
//     const cookies = req.cookies;
//     console.log(cookies);

//     res.json(cookies);
// });
