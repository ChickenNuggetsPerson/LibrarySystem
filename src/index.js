const express = require('express')
const session = require('express-session');
let FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const isbn = require('node-isbn');

let fileStoreOptions = {};
const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new FileStore(fileStoreOptions)
}));

const userSequelizer = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'users/users.sqlite',
});
const userTags = userSequelizer.define('tags', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    userID: Sequelize.STRING,
    firstName: Sequelize.STRING
})

async function createUser(username, pass, firstName) {
    const id = uuidv4();
    fs.mkdirSync("users/" + id);
    await userTags.create({
        username: Buffer.from(username).toString('base64'),
        password: Buffer.from(pass).toString('base64'),
        userID: id,
        firstName: Buffer.from(firstName).toString('base64')
    })
    await userTags.sync();
    console.log("Created User " + username);
    return id;
};
function deleteUser(id) {

}
async function userExists(username, pass) {
    console.log("Checking User " + username)
    await userTags.sync();
    const tag = await userTags.findOne({where: {
        username: Buffer.from(username).toString('base64'), 
        password: Buffer.from(pass).toString('base64')
    }})
    if (tag) {
        console.log("Logged in " + Buffer.from(tag.firstName, 'base64').toString("utf8"))
        return tag.userID;
    } else {
        return undefined;
    }
}
async function getFirstName(id) {
    await userTags.sync();
    const tag = await userTags.findOne({where: {
        userID: id
    }})
    if (tag) {
        return Buffer.from(tag.firstName, 'base64').toString("utf8");
    } else {
        return undefined;
    }
}




// Serve the Pages
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.render('login');
    }
    res.redirect('/library');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('/logout', (req, res) => {
    req.session.destroy(() => {});
    res.redirect('/');
});
app.get('/library', (req, res) => {
    if (!req.session.user) {
        console.log("not authed")
        return res.render('login');
    }
    res.render('library', { name: req.session.firstName });
})
app.get('/scanBook', (req, res) => {
    if (!req.session.user) {
        return res.render('login');
    }
    res.render('scanBook');
})
app.get('/addBook', (req, res) => {
    if (!req.session.user) {
        return res.render('login');
    }
    if (req.session.book) {
        res.render('addBook', {book: JSON.stringify(req.session.book)});
    } else {
        res.redirect('/scanBook');
    }
    
})


app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});
app.get('/debug', function(req, res) {

	let data = fs.readFileSync(__dirname + '/debug.html').toString().split("\n")
	data.splice(3, 0, "<script> data = " + JSON.stringify(req.session) + "</script>")
	let text = data.join("\n");
	res.send(text)
});


// Validation rules.
let loginValidate = [
    // Check Username
    check('username', 'Username Must Be an Email Address').isEmail().trim().escape().normalizeEmail(),
    // Check Password
    check('password').isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters').matches('[0-9]').withMessage('Password Must Contain a Number').matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter').trim().escape()
];

// Handle the login post
// Process User Input
app.post('/auth/login', loginValidate, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array() });
        //return res.sendFile(__dirname + '/web/login.html');
    }
	
    // Insert Login Code Here
    let id = await userExists(req.body.username, req.body.password);
    req.session.user = id;
    let name = await getFirstName(id);
    req.session.firstName = name;
    console.log(req.body)
    setTimeout(() => {
        res.redirect('/library');
    }, 500);
	
});
app.post('/auth/signup', loginValidate, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
        //return res.sendFile(__dirname + '/web/createAccount.html');
    }
        // Insert Login Code Here

    let id = await createUser(req.body.username, req.body.password, req.body.firstname);
    req.session.user = id;
    let name = await getFirstName(id);
    req.session.firstName = name;
    setTimeout(() => {
        res.redirect('/library');
    }, 500);
    
	
});
app.post('/library/scanBook', async (req, res) => {
    isbn.resolve(req.body.isbnCode.decodedText).then(function (book) {
            
        req.session.book = book;
        res.json({error: false});

    }).catch(function (err) {
        console.log('Book not found', err);
        res.json({error: true});
    });
})
app.post('/library/addBook', async (req, res) => {
    if (req.body.answerResult) {

        // Add Book
        console.log("adding book")
        req.session.book = undefined;
        res.send("Acknoledged")

    } else {
        console.log("not adding book")
        req.session.book = undefined;
        res.send("Acknoledged")
    }
})


app.listen(8888, () => {
    console.log('The application is listening on port 8888');
    userTags.sync();
})
    