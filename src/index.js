const express = require('express')
let pem = require('pem');
const https = require('https')
const session = require('express-session');
let FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const isbn = require('node-isbn');
const multer  = require('multer')
const cron = require('node-cron');



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
const userTags = userSequelizer.define('user', {
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
    categories: Sequelize.STRING,
    bookUUID: Sequelize.STRING
}, {
    tableName: 'libraries'
})
const checkoutTags = userSequelizer.define('checkout', {
    userID: Sequelize.STRING,
    checkoutID: Sequelize.STRING,
    student: Sequelize.STRING,
    bookUUID: Sequelize.STRING,
    bookOBJ: Sequelize.STRING,
    returnDate: Sequelize.STRING
}, {
    tableName: 'checkouts'
})


async function createUser(username, pass, firstName) {
    const id = uuidv4();
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
    await libraryTags.create({
        userID: userid,
        title: (book?.title == undefined) ? "Not Provied" : book.title,
        isbn: (book?.isbn == undefined) ? "Not Provided" : book.isbn,
        author: (book?.authors == undefined) ? "Not Provided" : book.authors[0],
        description: (book?.description == undefined) ? "Not Provided" : book.description,
        pageCount: (book?.pageCount == undefined) ? "Not Provided" : book.pageCount,
        imageLink: (book?.imageLinks?.thumbnail == undefined) ? "Not Provided" : book.imageLinks.thumbnail,
        categories: JSON.stringify(book.categories),
        bookUUID: uuidv4()
    })
    await libraryTags.sync();
}
async function removeBook(userid, bookID) {
    await libraryTags.sync();
    const tag = await libraryTags.destroy({where: {
        userID: userid,
        bookUUID: bookID
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
        if(rowDeleted === 1){
            return true;
            }
        }, function(err){
            console.log(err); 
            return false;
        });
}
async function getLibrary(userid) {
    await libraryTags.sync();
    const tags = await libraryTags.findAll({where: {
        userID: userid
    }})
    return tags;
}
async function getBook(bookID) {
    libraryTags.sync();
    return await libraryTags.findOne({ where: {
        bookUUID: bookID
    }})
}
async function checkoutBook(userid, book, student, checkoutday) {
    const date = new Date(checkoutday);
    const minutes = 0
    const hours = 8;
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    const cronString = `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`;

    await checkoutTags.create({
        userID: userid,
        checkoutID: uuidv4(),
        student: student,
        bookUUID: book.bookUUID,
        bookOBJ: JSON.stringify(book),
        returnDate: cronString
    })

    restartNots();
}
async function removeCheckoutCheckID(checkoutID) {
    await checkoutTags.sync();
    const tag = await checkoutTags.destroy({where: {
        checkoutID: checkoutID,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
        if(rowDeleted === 1){
            restartNots()
            return true;
            }
        }, function(err){
            console.log(err); 
            restartNots()
            return false;
        });
}
async function removeCheckoutBookID(bookUUID) {
    await checkoutTags.sync();
    const tag = await checkoutTags.destroy({where: {
        bookUUID: bookUUID,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
        if(rowDeleted === 1){
            restartNots()
            return true;
            }
        }, function(err){
            console.log(err); 
            restartNots()
            return false;
        });
}
async function getCheckouts(userID) {
   await checkoutTags.sync();
   const tags = await checkoutTags.findAll({ where: {
    userID: userID
   }})
   return tags;
}
async function isCheckedout(bookUUID) {
    await checkoutTags.sync();
    const tag = await checkoutTags.findOne({where: {
        bookUUID: bookUUID
    }})
    if (tag) {
        return tag;
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
        return res.render('login');
    }
    if (req.session.checkout) { req.session.checkout = undefined; }
    res.render('library', { name: req.session.firstName });
})
app.get('/fetchLibrary', async (req, res) => {
    if (!req.session.user) {
        res.status(400);
        return res.send('None shall pass');
    }

    res.json(await getLibrary(req.session.user))
})
app.get('/fetchCheckouts', async (req, res) => {
    if (!req.session.user) {
        res.status(400);
        return res.send('None shall pass');
    }

    res.json(await getCheckouts(req.session.user))
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
app.get('/checkout', (req, res) => {
    if (!req.session.user) {
        return res.render('login');
    }
    if (req.session.checkout) {
        res.render('checkout', {book: JSON.stringify(req.session.checkout)});
    } else {
        res.redirect('/library');
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
    if (!req.session.user) {
        return res.json({error: true});
    }
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
    if (!req.session.user) {
        return res.send("afds");
    }
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


app.post('/library/removeBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    let result = await removeBook(req.session.user, req.body.bookID);
    res.json({error: result});
})


app.post('/library/checkoutBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    req.session.checkout = await getBook(req.body.bookID)
    res.json({error: false});
})
app.post('/library/checkoutConfirm', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    if (!req.session.checkout) {
        return res.json({error: true});
    }
    await checkoutBook(req.session.user, req.session.checkout, req.body.student, req.body.returnDate);
    res.json({error: false});
})
app.post('/library/returnBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    res.json({error: !removeCheckoutBookID(req.body.bookID)});
})



// Checkout reminder system
let notifications = []
async function restartNots() {
    console.log("")
    if (notifications.length != 0) {
        console.log("Stopping Cron Tasks")
        for (let i = 0; i < notifications.length; i++) {
            notifications[i].stop()
        }
    }
    notifications = []
    const checkouts = await checkoutTags.findAll();
    let i = 0;
    console.log("Starting Cron Tasks")
    checkouts.forEach( checkout => {
        if (cron.validate(checkout.dataValues.returnDate)) {
            notifications[i] = cron.schedule(checkout.dataValues.returnDate, function(){
                announceNot(checkout.dataValues.checkoutID)
            })
        } else {
            console.log("Skipping Checkout: " + checkout.dataValues.checkoutID)
        }
        
        
        i++;
    })
}

function announceNot(notID) {
    console.log("announce: " + notID)
    //removeCheckoutCheckID(notID);
}



app.listen(8888, async () => {
    console.log('The application is listening on port 8888');
    await userTags.sync();
    await libraryTags.sync();
    await checkoutTags.sync();
    restartNots()
})
    
/*
function startHTTPS(hostname, port) {
	pem.createCertificate({ days: 365, selfSigned: true, commonName: hostname }, function (err, keys) {
		if (err) {
			return console.log(err);
		}

		https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app)
		.listen(port, () => {
			console.log('Https Server is running on port: ', port);
		});
	});
}

startHTTPS("192.168.50.197", 8888);
*/


