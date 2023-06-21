const express = require('express')
const session = require('express-session');
let FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const isbn = require('node-isbn');
const multer  = require('multer')




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    }
  })
  

const upload = multer({ storage: storage })



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
app.use('/uploads', express.static('./uploads'))
app.use('/static', express.static('./src/static'))

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
const libraryTags = userSequelizer.define('book', {
    userID: Sequelize.STRING,
    title: Sequelize.STRING,
    isbn: Sequelize.STRING,
    author: Sequelize.STRING,
    description: Sequelize.STRING,
    pageCount: Sequelize.STRING,
    imageLink: Sequelize.STRING,
    bookUUID: Sequelize.STRING
}, {
    tableName: 'libraries'
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
    return id;
};
function deleteUser(id) {

}
async function userExists(username, pass) {
    await userTags.sync();
    const tag = await userTags.findOne({where: {
        username: Buffer.from(username).toString('base64'), 
        password: Buffer.from(pass).toString('base64')
    }})
    if (tag) {
        return tag.userID;
    } else {
        return undefined;
    }
}
async function getFirstName(id) {
    if (id == undefined) { return undefined; }
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
async function addBook(userid, book) {
    fs.writeFileSync("lastBook.json", JSON.stringify(book))
    console.log("Adding Book: " + book.title)
    await libraryTags.create({
        userID: userid,
        title: (book?.title == undefined) ? "Not Provied" : book.title,
        isbn: (book?.isbn == undefined) ? "Not Provided" : book.isbn,
        author: (book?.authors == undefined) ? "Not Provided" : book.authors[0],
        description: (book?.description == undefined) ? "Not Provided" : book.description,
        pageCount: (book?.pageCount == undefined) ? "Not Provided" : book.pageCount,
        imageLink: (book?.imageLinks?.thumbnail == undefined) ? "Not Provided" : book.imageLinks.thumbnail,
        bookUUID: uuidv4()
    })
    await libraryTags.sync();
}
async function removeBook(userid, bookID) {

}
async function getLibrary(userid) {
    await libraryTags.sync();
    const tags = await libraryTags.findAll({where: {
        userID: userid
    }})
    return tags;
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
        return res.render('login');
    }
    res.render('library', { name: req.session.firstName });
})
app.get('/fetchLibrary', async (req, res) => {
    if (!req.session.user) {
        res.status(400);
        return res.send('None shall pass');
    }

    res.json(await getLibrary(req.session.user))
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
app.get('/uploads', (req, res) => {
    console.log(req.baseUrl)
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
    // Insert Login Code Here
    let id = await userExists(req.body.username, req.body.password);
    req.session.user = id;
    let name = await getFirstName(id);
    req.session.firstName = name;
    setTimeout(() => {
        res.redirect('/library');
    }, 500);
});
app.post('/auth/signup', loginValidate, async (req, res) => {
    let id = await createUser(req.body.username, req.body.password, req.body.firstname);
    req.session.user = id;
    let name = await getFirstName(id);
    req.session.firstName = name;
    setTimeout(() => {
        res.redirect('/library');
    }, 500);
    
	
});

app.post('/library/scanBook', async (req, res) => {
    if (req.body.isbnCode.decodedText == null) { return res.json({error: true}); }
    isbn.resolve(req.body.isbnCode.decodedText).then(function (book) {
            
        req.session.book = book;
        req.session.book.isbn = req.body.isbnCode.decodedText
        res.json({error: false});

    }).catch(function (err) {
        //console.log(err)
        res.json({error: true});
    });
})
app.post('/library/manualScanBook', upload.single('image'), async (req, res) => {
    //console.log(req.body)
    //console.log(req.file.destination + "/" + req.file.filename)
    try {
        if (req.session?.book == undefined) {
            const tempBook = {
                title: req.body.title,
                isbn: req.body.isbn,
                imageLinks: {
                    thumbnail: req.file.destination + "/" + req.file.filename
                }
            }
            req.session.book = tempBook
            res.redirect("/addBook")
        } else {
            req.session.book.imageLinks = { thumbnail: "" };
            req.session.book.imageLinks.thumbnail = req.file.destination + "/" + req.file.filename;
            addBook(req.session.user, req.session.book)
            req.session.book = undefined;
            res.redirect("/library")
        }
    } catch (err) {
        console.log(err)
        req.session.book = undefined;
        res.redirect("/library")
    }
    

    
})
app.post('/library/addBook', async (req, res) => {
    if (req.body.answerResult) {

        // Add Book
        addBook(req.session.user, req.session.book)
        req.session.book = undefined;
        res.send("Acknoledged")

    } else {
        req.session.book = undefined;
        res.send("Acknoledged")
    }
})


app.listen(8888, () => {
    console.log('The application is listening on port 8888');
    userTags.sync();
    libraryTags.sync();
})
    