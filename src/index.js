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
const fetch = require('node-fetch');
var path = require('path')
var morgan = require('morgan')
var rfs = require('rotating-file-stream') 


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
app.use('/', express.static('./rootFiles'))


// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: "./logs"
  })
app.use(morgan('combined', { stream: accessLogStream }));



async function searchBook(isbn) {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    let settings = { method: "Get" };
    const response = await fetch(url, settings)
    const data = await response.json()
    return data[`ISBN:${isbn}`]
}


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
    returnDate: Sequelize.STRING,
    rawReturnDate: Sequelize.STRING
}, {
    tableName: 'checkouts'
})
const categoryTags = userSequelizer.define('category', {
    userID: Sequelize.STRING,
    name: Sequelize.STRING,
    categoryUUID: Sequelize.STRING,
    books: Sequelize.STRING
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
async function deleteUser(id) {
    await userTags.sync();
    await userTags.destroy({where: {
        userID: id,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
        if(rowDeleted === 1){
            userTags.sync();
            return true;
            }
        }, function(err){
            console.log(err);
            userTags.sync(); 
            return false;
    });
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
        author: (book?.authors == undefined) ? "Not Provided" : book.authors[0].name,
        description: (book?.excerpts == undefined) ? "Not Provided" : book.excerpts[0].text,
        pageCount: (book?.number_of_pages == undefined) ? "Not Provided" : book.number_of_pages,
        imageLink: (book?.cover?.large == undefined) ? "Not Provided" : book.cover.large,
        categories: JSON.stringify([]),
        bookUUID: uuidv4()
    })
    await libraryTags.sync();
}
async function removeBook(userid, bookID) {
    await libraryTags.sync();
    const book = await libraryTags.findOne({where: {
        userID: userid,
        bookUUID: bookID
    }})
    if (!book) {return false;}
    JSON.parse(book.dataValues.categories).forEach((cat) => {
        removeBookFromCategoryName(bookID, cat, userid)
    })

    if (book.dataValues.imageLink.startsWith("/uploads")) {
        fs.unlinkSync("." + book.dataValues.imageLink);
    }

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
async function getBook(bookID, userid) {
    libraryTags.sync();
    return await libraryTags.findOne({ where: {
        bookUUID: bookID,
        userID: userid
    }})
}
async function updateBook(bookID, userid, newBookItems) {
    let book = await libraryTags.findOne({ where: { userID: userid, bookUUID: bookID } })
    if (book) {
        await book.update({
            title: (newBookItems?.title == undefined) ? book.dataValues.title : newBookItems.title,
            isbn: (newBookItems?.isbn == undefined) ? book.dataValues.isbn : newBookItems.isbn,
            author: (newBookItems?.authors == undefined) ? book.dataValues.author : newBookItems.author,
            description: (newBookItems?.description == undefined) ? book.dataValues.description : newBookItems.description,
            pageCount: (newBookItems?.pageCount == undefined) ? book.dataValues.pageCount : newBookItems.pageCount,
            imageLink: (newBookItems?.imageLinks?.thumbnail == undefined) ? book.dataValues.imageLink : newBookItems.imageLink,
            categories: (newBookItems?.categories == undefined) ? book.dataValues.categories : JSON.stringify(newBookItems.categories),
        })
        await libraryTags.sync()
        return true;
    }
    return false;
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
        returnDate: cronString,
        rawReturnDate: checkoutday
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


async function createCategory(name, userID) {
    await categoryTags.create({
        userID: userID,
        name: name,
        categoryUUID: uuidv4(),
        books: JSON.stringify([])
    })
    await categoryTags.sync();
    return true;
}
async function removeCategory(categoryID, userID) {
    await categoryTags.sync();
    
    const category = await categoryTags.findOne({where: {
        categoryUUID: categoryID,
        userID: userID
    }})
    let books = JSON.parse(category.dataValues.books)
    for (let i = 0; i < books.length; i++) {
        removeCatFromBook(books[i], category.dataValues.name, userID)
    }

    await categoryTags.sync();
    const tag = await categoryTags.destroy({where: {
        categoryUUID: categoryID,
        userID: userID
    }}).then(async function(rowDeleted){ // rowDeleted will return number of rows deleted
        if(rowDeleted === 1){
            await categoryTags.sync();
            return true;
            }
        }, async function(err){
            console.log(err); 
            await categoryTags.sync();
            return false;
        });
}
async function getCategories(userID) {
    await categoryTags.sync();
    const categorys = await categoryTags.findAll({where: {
        userID: userID
    }})
    return categorys;
}
async function getBooksInCategory(categoryID, userID) {
    await categoryTags.sync();
    const category = await categoryTags.findAll({where: {
        userID: userID,
        categoryUUID: categoryID
    }})
    let bookIds = JSON.parse(category.dataValues.books)
    let books = []

    bookIds.forEach(async (id) => {
        books.push(await getBook(id, userID))
    })

    return books;
}
async function addBookToCategory(bookID, categoryID, userID) {
    let category = await categoryTags.findOne({ where: { userID: userID, categoryUUID: categoryID } })
    if (category) {
        let array = JSON.parse(category.dataValues.books)
        array.push(bookID)
        category.update({
            books: JSON.stringify(array)
        })
        await categoryTags.sync()

        await addCatToBook(bookID, category.dataValues.name, userID);
        
        return true;
    }
    return false;

}
async function removeBookFromCategory(bookID, categoryID, userID) {
    let category = await categoryTags.findOne({ where: { userID: userID, categoryUUID: categoryID } })

    if (category) {
        let newarray = JSON.parse(category.dataValues.books)
        newarray.splice(newarray.indexOf(bookID), 1)
        category.update({
            books: JSON.stringify(newarray)
        })
        await categoryTags.sync()

        await removeCatFromBook(bookID, category.dataValues.name, userID)

        return true;
    }
    return false;

}
async function removeBookFromCategoryName(bookID, categoryName, userID) {
    let category = await categoryTags.findOne({ where: { userID: userID, name: categoryName } })

    if (category) {
        let newarray = JSON.parse(category.dataValues.books)
        newarray.splice(newarray.indexOf(bookID), 1)
        category.update({
            books: JSON.stringify(newarray)
        })
        await categoryTags.sync()

        return true;
    }
    return false;

}



function removeDuplicates(array) {
    const encountered = [];
    for (let i = 0; i < array.length; i++) {
        if (!encountered.includes(array[i])) {
            encountered.push(array[i])
        }
    }
    return encountered
}
function findStringInArray(str, array) {
    for (let i = 0; i < array.length; i++) {
      if (str === array[i]) {
        return { match: true, index: i }; // Found a match with index
      }
    }
    return { match: false, index: -1 }; // No match found with -1 index
}
async function refreshDisplayCategories(bookID, userID) {
    let newCategories = [];
    let categories = await getCategories(userID)
    for (let i = 0; i < categories.length; i++) {
        let array = JSON.parse(categories[i].dataValues.books)
        if (findStringInArray(bookID, array).match) {
            newCategories.push(categories[i].dataValues.name)
        }
    }
    await updateBook(bookID, userID, {categories: removeDuplicates(newCategories)})
}
async function fixLibrary(userID) {
    let library = await getLibrary(userID)
    library.forEach(async (book) => {
        await refreshDisplayCategories(book.bookUUID, userID);
    })
}

async function addCatToBook(bookID, catName, userID) {
    try {
        let book = await getBook(bookID, userID)
        let bookCats = JSON.parse(book.dataValues.categories)
        bookCats.push(catName)
        await updateBook(bookID, userID, { categories: removeDuplicates(bookCats)});
        await refreshDisplayCategories(bookID, userID)
    } catch(err) {}
    
}
async function removeCatFromBook(bookID, catName, userID) {
    try {
        let book = await getBook(bookID, userID)
        let bookCats = JSON.parse(book.dataValues.categories)
        bookCats.splice(bookCats.indexOf(catName), 1)
        await updateBook(bookID, userID, { categories: removeDuplicates(bookCats)});
        await refreshDisplayCategories(bookID, userID)
    } catch(err) {}
}



// Serve the Pages
app.get('/', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.render('login');
    }

    res.redirect('/library');
});
app.get('/login', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    res.render('login');
});
app.get('/signup', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    res.render('signup');
});
app.get('/logout', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    req.session.destroy(() => {});
    res.redirect('/');
});
app.get('/library', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
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
app.get('/fetchCategories', async (req, res) => {
    if (!req.session.user) {
        res.status(400);
        return res.send('None shall pass');
    }

    res.json(await getCategories(req.session.user))
})
app.get('/scanBook', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.render('login');
    }
    res.render('scanBook');
})
app.get('/addBook', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
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
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.render('login');
    }
    if (req.session.checkout) {
        res.render('checkout', {book: JSON.stringify(req.session.checkout)});
    } else {
        res.redirect('/library');
    }
})
app.get('/editBook/:bookID', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.render('login');
    }
    if (req.params.bookID) {
        res.render('editBook', {book: JSON.stringify(await getBook(req.params.bookID, req.session.user))});
    } else {
        res.redirect('/library');
    }
})
app.get('/categories', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.render('login');
    }

    res.render('categories');
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
app.get('/library/fix', async function(req, res) {
    if (!req.session.user) {
        return res.render('login');
    }
    await fixLibrary(req.session.user)
    res.redirect('/library');
}) 

app.get('/library/search/category/:categoryID', async (req, res) => {
    if (!req.session.user) {
        return res.render('login');
    }
    if (req.params.categoryID) {
        res.json(await getBooksInCategory(req.params.categoryID, req.session.user));
    } else {
        res.json([])
    }
})

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
    if (!req?.body?.isbnCode) { 
        return res.json({error: true}); 
    }

    const book = await searchBook(req.body.isbnCode.decodedText)

    if (!book?.title) {
        return res.json({error: true})
    }
            
    req.session.book = book;
    req.session.book.isbn = req.body.isbnCode.decodedText
    res.json({error: false});

   
})
app.post('/library/manualScanBook', upload.single('image'), async (req, res) => {
    try {
        if (req.session?.book == undefined) {
            const tempBook = {
                title: req.body.title,
                isbn: req.body.isbn,
                imageLinks: {
                    thumbnail: (req.file.destination + "/" + req.file.filename).substring(1)
                }
            }
            req.session.book = tempBook
            res.redirect("/addBook")
        } else {
            req.session.book.imageLinks = { thumbnail: "" };
            req.session.book.imageLinks.thumbnail = (req.file.destination + "/" + req.file.filename).substring(1);
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
        await addBook(req.session.user, req.session.book)
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
    await removeCheckoutBookID(req.body.bookID)
    res.json({error: result});
})


app.post('/library/checkoutBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    req.session.checkout = await getBook(req.body.bookID, req.session.user)
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

app.post('/library/editBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    let book = await libraryTags.findOne({ where: { userID: req.session.user, bookUUID: req.body.bookUUID } })
    if (book) {
        await book.update({
            title: req.body.title,
            author: req.body.author,
        })
        await libraryTags.sync()
    }
    res.redirect("/library")
})



app.post('/categories/add', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    let result = await createCategory(req.body.name, req.session.user);
    res.json({error: !result});
})
app.post('/categories/remove', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    let result = await removeCategory(req.body.catID, req.session.user);
    res.json({error: result});
})
app.post('/categories/addBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    let result = await addBookToCategory(req.body.bookID, req.body.catID, req.session.user);
    res.json({error: !result});
})
app.post('/categories/removeBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    let result = await removeBookFromCategory(req.body.bookID, req.body.catID, req.session.user);
    res.json({error: !result});
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

async function initTags() {
    await userTags.sync();
    await libraryTags.sync();
    await checkoutTags.sync();
    await categoryTags.sync();
    restartNots()
}
initTags();



let port = 8080

if (process.platform == "linux") {
    const options = {
        key: fs.readFileSync('/home/hayden/Desktop/LibrarySystem/privkey.pem'),
        cert: fs.readFileSync('/home/hayden/Desktop/LibrarySystem/cert.pem')
    };
    const server = https.createServer(options, app);
    server.listen(port, () => {
      console.log('Production server running on port: ' + port);
    });  
} else {
    app.listen(port, () => {
        console.log('Dev Server running on port: ' + port);
    })
}





// Redirect Server
const http = require('http');

const redirectServer = http.createServer((req, res) => {
  const { headers, method, url } = req;
  const location = `http://${headers.host.replace(/:\d+$/, '')}:8080${url}`;
  res.writeHead(302, { Location: location });
  res.end();
});

redirectServer.listen(80, () => {
  console.log('Redirect server running on port 80');
});




