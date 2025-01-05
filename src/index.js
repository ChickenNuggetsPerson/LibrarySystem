const express = require('express')
const compression = require('compression');
let pem = require('pem');
const https = require('https')
const session = require('express-session');
let FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');
const { Sequelize, DataTypes, UUIDV4 } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const multer  = require('multer')
const cron = require('node-cron');
const fetch = require('node-fetch');
var path = require('path')
var morgan = require('morgan')
var rfs = require('rotating-file-stream') 
var ISBN = require('./node-isbn-cataloge.js');

const { AutoUpdater } = require('./autoUpdater.js')

function fileFilter (req, file, cb) {
    // To accept the file pass `true`, like so:
    console.log("")
    console.log("Upload: " + file.originalname)
    cb(null, file.mimetype.startsWith("image"))
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    }
})
const upload = multer({ storage: storage, fileFilter: fileFilter})



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
app.use(compression()); 


// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: "./logs"
})
app.use(morgan('combined', { stream: accessLogStream }));




function convertISBNBookToOpenLibrary(isbnBook) {
    let book = {};
    book.title = (isbnBook?.title == undefined) ? "Not Provided" : isbnBook.title
    book.isbn = (isbnBook?.isbn == undefined) ? "Not Provided" : isbnBook.isbn
    book.authors = [{name: (isbnBook?.authors == undefined) ? "Not Provided" : isbnBook.authors[0]}]
    book.description = (isbnBook?.description == undefined) ? "Not Provided" : isbnBook.description
    book.pageCount = (isbnBook?.pageCount == undefined) ? "Not Provided" : isbnBook.pageCount
    book.imageLink = (isbnBook?.imageLinks?.thumbnail == undefined) ? "Not Provided" : isbnBook.imageLinks.thumbnail
    return book
}

async function searchGoogleBook(isbn) {
    return new Promise(resolve => {
        ISBN.resolve(isbn, function (err, book) {
            if (err) {
                // Try Openlibrary
                console.log("Could Not Find Book")
                resolve({})
            } else {
                // Return Larger Database Book
                console.log("Found Book")
                resolve(convertISBNBookToOpenLibrary(book))
            }
        });
    })
}
async function searchOpenLibrary(isbn) {
    return new Promise(async (resolve) => {
        const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
        let settings = { method: "Get" };
        const response = await fetch(url, settings)
        const data = await response.json()
        let book = data[`ISBN:${isbn}`]
        if (book?.title) {
            console.log("Found Book")
            resolve(book)
        } else {
            console.log("Still Couldn't Find Book")
            resolve({})
        }
    })
}
async function searchBook(isbn) {
    return new Promise(async (resolve) => {

        // Try Larger Database
        console.log("")
        console.log("Trying Larger Database for: " + isbn)
        let book = {}
        try {
            book = await searchGoogleBook(isbn)
            return resolve(book)
        } catch (err) {}
        console.log("Trying OpenLibrary")
        try {
            book = await searchOpenLibrary(isbn)
            return resolve(book)
        } catch(err) {}

        resolve(book)
    })
}


const userSequelizer = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'users/users.sqlite',
});
const userTags = userSequelizer.define('user', {
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


const crypto = require('crypto');

function encrypt(text, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return salt.toString('hex') + iv.toString('hex') + encrypted + authTag;
}
function decrypt(encryptedText, password) {
    try {
        const salt = Buffer.from(encryptedText.slice(0, 32), 'hex');
        const iv = Buffer.from(encryptedText.slice(32, 64), 'hex');
        const encrypted = encryptedText.slice(64, -32);
        const authTag = Buffer.from(encryptedText.slice(-32), 'hex');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch(err) { 
        return ""
    }
}


async function createUser(username, pass, firstName) {
    const id = uuidv4();
    await userTags.create({
        password: encrypt(username, pass),
        userID: id,
        firstName: encrypt(firstName, pass)
    })
    await userTags.sync();
    return id;
};
async function deleteUser(id) {
    console.log("Deleting: ", id)
    await userTags.sync();
    await userTags.destroy({where: {
        userID: id,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
            userTags.sync();
        }, function(err){
            console.log(err);
            userTags.sync(); 
    });
    await libraryTags.sync();
    await libraryTags.destroy({where: {
        userID: id,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
            libraryTags.sync();
        }, function(err){
            console.log(err);
            libraryTags.sync(); 
    });
    await categoryTags.sync();
    await categoryTags.destroy({where: {
        userID: id,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
            categoryTags.sync();
        }, function(err){
            console.log(err);
            categoryTags.sync(); 
    });
    await checkoutTags.sync();
    await checkoutTags.destroy({where: {
        userID: id,
    }}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
            checkoutTags.sync();
            restartNots()
        }, function(err){
            console.log(err);
            checkoutTags.sync(); 
            restartNots()
    });
    
}
async function editUser(id, username, pass, firstName) {
    let user = await userTags.findOne({ where: { userID: id } })
    if (user) {
        await user.update({
            password: encrypt(username, pass),
            firstName: encrypt(firstName, pass)
        })
        await userTags.sync()
        return true;
    }
    return false;
}
async function userExists(username, pass) {
    await userTags.sync();
    let users = await userTags.findAll();
    for (let i = 0; i < users.length; i++) {
        let user = users[i]
        if (decrypt(user.dataValues.password, pass) == username) {
            return user.dataValues.userID
        }
    }
    return undefined; 
}
async function getFirstName(id, pass) {
    if (id == undefined) { return undefined; }
    await userTags.sync();
    const tag = await userTags.findOne({where: {
        userID: id
    }})
    if (tag) {
        return decrypt(tag.dataValues.firstName, pass);
    } else {
        return undefined;
    }
}

async function adminGetUsers() {
    await userTags.sync();
    const tags = await userTags.findAll()
    let list = [];
    tags.forEach(tag => {
        list.push(tag.userID)
    })
    return list;
}

async function addBook(userid, book) {
    //fs.writeFileSync("lastBook.json", JSON.stringify(book))
    let uuid = uuidv4()
    await libraryTags.create({
        userID: userid,
        title: (book?.title == undefined) ? "Not Provied" : book.title,
        isbn: (book?.isbn == undefined) ? "Not Provided" : book.isbn,
        author: (book?.authors == undefined) ? "Not Provided" : book.authors[0].name,
        description: (book?.excerpts == undefined) ? "Not Provided" : book.excerpts[0].text,
        pageCount: (book?.number_of_pages == undefined) ? "Not Provided" : book.number_of_pages,
        imageLink: (book?.imageLink == undefined) ? "Not Provided" : book.imageLink,
        categories: JSON.stringify([]),
        bookUUID: uuid
    })
    await libraryTags.sync();
    return uuid
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
        try {
            fs.unlinkSync("." + book.dataValues.imageLink);
        } catch(err) {
            console.log(err)
        }
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
    // console.log(req.headers.host)
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
app.get('/quickLogin/:loginCode', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.params.loginCode) {
        res.redirect('/login');
    }
    // Do this
});
app.get('/resetLogin', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    res.render('resetLogin');
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


    let bookHighlight = req.session.highlight;
    req.session.highlight = ""
    res.render('library', { name: JSON.stringify(req.session.firstName), isAdmin: req.session.isAdmin, highlight: JSON.stringify(bookHighlight)});
    
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
        res.redirect('/scanBook')
    }
})
app.get('/uploads', (req, res) => {
    // console.log(req.baseUrl)
})
app.get('/checkout', (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.render('login');
    }
    if (req.session.checkout) {
        req.session.highlight = req.session.checkout.bookUUID;
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
        req.session.highlight = req.params.bookID;
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



app.get('/admin/login', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.redirect("/");
    }
    res.render('adminLogin')
})
app.get('/admin/view', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    if (!req.session.user) {
        return res.redirect("/");
    }
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    res.render('adminView', {
        userData: JSON.stringify(await adminGetUsers()), 
        resetCodes: JSON.stringify(getAllResetCodes()),
        versionNum: JSON.stringify(updater.currentVersion)
    })
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



function format(seconds){
    function pad(s){
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}


app.get('/stats', async (req, res) => {
    var uptime = process.uptime();
    res.json({
        running: true, 
        uptime: format(uptime)
    })
})


// Validation rules.
let loginValidate = [
    // Check Username
    check('username', 'Username Must Be an Email Address').isEmail().trim().escape().normalizeEmail(),
    // Check Password
    check('password').isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters').matches('[0-9]').withMessage('Password Must Contain a Number').matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter').trim().escape()
];



function isSignupCode(code) {
    if (process.platform != 'linux') {
        return true;
    }
    
    let codes = JSON.parse(fs.readFileSync('/home/hayden/Desktop/LibrarySystem/signupCodes.json'))


    for (let i = 0; i < codes.length; i++) {
        if (code === codes[i]) {
            console.log("Signup Code Used: " + code[i])
            return true
        }
    }
    return false
}
function isAdminLogin(username, password) {
    if (process.platform != 'linux') {
        return true;
    }
    if (!username || !password) {
        return false
    }
    let adminCreds = JSON.parse(fs.readFileSync('/home/hayden/Desktop/LibrarySystem/adminCreds.json'))
    return adminCreds.username == username && adminCreds.password == password
}


function createResetCode(userID) {
    // Return code
    let codes = JSON.parse(fs.readFileSync('users/resetCodes.json'))
    let codeUUID = uuidv4()
    let newCode = {
        userID: userID,
        codeUUID: codeUUID
    }
    codes.push(newCode)
    fs.writeFileSync('users/resetCodes.json', JSON.stringify(codes))
    return codeUUID
}
function removeResetCode(resetCode) {
    let codes = JSON.parse(fs.readFileSync('users/resetCodes.json'))
    let foundIndex = -1;
    for (let i = 0; i < codes.length; i++) {
        if (codes[i].codeUUID == resetCode) {
            foundIndex = i
        }
    }
    if (foundIndex == -1) {
        return false;
    } else {
       codes.splice(foundIndex, 1)
       fs.writeFileSync('users/resetCodes.json', JSON.stringify(codes))
       return true;
    }
}
function removeResetCodeUser(userID) {
    let codes = JSON.parse(fs.readFileSync('users/resetCodes.json'))
    let foundIndex = -1;
    for (let i = 0; i < codes.length; i++) {
        if (codes[i].userID == userID) {
            foundIndex = i
        }
    }
    if (foundIndex == -1) {
        return false;
    } else {
       codes.splice(foundIndex, 1)
       fs.writeFileSync('users/resetCodes.json', JSON.stringify(codes))
       return true;
    }
}
function getAllResetCodes() {
    return JSON.parse(fs.readFileSync('users/resetCodes.json'))
}
function getUserFromResetCode(resetCode) {
    let codes = JSON.parse(fs.readFileSync('users/resetCodes.json'))
    for (let i = 0; i < codes.length; i++) {
        if (codes[i].codeUUID == resetCode) {
            return codes[i].userID
        }
    }
    return undefined
}
function userHasResetCode(userID) {
    let codes = JSON.parse(fs.readFileSync('users/resetCodes.json'))
    for (let i = 0; i < codes.length; i++) {
        if (codes[i].userID == userID) {
            return true
        }
    }
    return false
}


// Handle the login post
app.post('/auth/login', upload.none(), async (req, res) => {
    // Insert Login Code Here
    let id = await userExists("@" + req.body.username, req.body.password);
    req.session.user = id;
    let name = await getFirstName(id, req.body.password);
    req.session.firstName = name;
    req.session.isAdmin = false;
    req.session.highlight = "";
    if (!req.session.user) {
        res.status(401);
        res.send('None shall pass');
    } else {
        res.status(200);
        res.send('Ok');
    }
});
app.post('/auth/signup', upload.none(), async (req, res) => {
    if (!isSignupCode(req.body.signupcode)) {
        res.status(401);
        res.send('None shall pass');
    }
    let id = await createUser("@" + req.body.username, req.body.password, req.body.firstname);
    req.session.user = id;
    let name = await getFirstName(id, req.body.password);
    req.session.firstName = name;
    req.session.isAdmin = false;
    req.session.highlight = "";
    if (!req.session.user) {
        res.status(401);
        res.send('None shall pass');
    } else {
        res.status(200);
        res.send('Ok');
    }
});
app.post('/user/delete', async (req,res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    await deleteUser(req.session.user)
    res.json({error: false})
})
app.post('/auth/resetLogin', upload.none(), async (req, res) => {
    let userID = getUserFromResetCode(req.body.signupcode)
    if (userID == undefined) {
        res.status(401);
        res.send('error');
        return
    }

    let result = await editUser(userID, "@" + req.body.username, req.body.password, req.body.firstname);

    if (!result) {
        res.status(401);
        res.send('error');
    } else {
        removeResetCode(req.body.signupcode)
        res.status(200);
        res.send('Ok');
    }
})
app.post('/auth/adminLogin', upload.none(), async (req, res) => {
    // Insert Login Code Here
    req.session.isAdmin = isAdminLogin(req.body.username, req.body.password)
    if (!req.session.user) {
        res.status(401);
        res.send('None shall pass');
    } else {
        res.status(200);
        res.send('Ok');
    }
});


app.post('/admin/viewUser', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    if (!req.session.isAdmin) {
        return res.json({error: true});
    }
    if (!req.body.user) {
        return res.json({error: true});
    }
    req.session.user = req.body.user
    req.session.firstName = "Viewing As Admin"
    req.session.highlight = "";
    return res.json({error: false});
})
app.post('/admin/resetUser', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    if (!req.session.isAdmin) {
        return res.json({error: true});
    }
    if (!req.body.user) {
        return res.json({error: true});
    }
    if (userHasResetCode(req.body.user)) {
        removeResetCodeUser(req.body.user)
        return res.json({error: false});
    }
    
    createResetCode(req.body.user)

    return res.json({error: false});
})
app.post('/admin/forceUpdate', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }
    if (!req.session.isAdmin) {
        return res.json({error: true});
    }

    setTimeout(() => {
        updater.check()
    }, 1000);

    return res.json({error: false});
})

function sanitize(string) {
    try {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        const reg = /[&<>"'/]/ig;
        return string.replace(reg, (match)=>(map[match]));
    } catch (err) {
        return string
    }
}

app.post('/library/scanBook', async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }

    if (!req?.body?.isbnCode) { 
        return res.json({error: true}); 
    }

    let book;
    if (req.body.isbnCode.decodedText) {
        // Scanned Code
        book = await searchBook(req.body.isbnCode.decodedText)
    } else {
        // Manual inputed code
        book = await searchBook(req.body.isbnCode)
    }

    if (!book?.title) {
        return res.json({error: true}) // Return error if no book was found
    }
            
    req.session.book = book;
    req.session.book.isbn = req.body.isbnCode.decodedText
    res.json({error: false});


})
app.post('/library/manualScanBook', upload.single('image'), async (req, res) => {
    try {
        
        if (req.session?.book == undefined) {
            // ScanBook Page, Completely new book    
            const tempBook = {
                title: sanitize(req.body.title),
                authors: [{name: sanitize(req.body.author)}],
                isbn: sanitize(req.body.isbn),
                cover: { 
                    large: (req?.file?.destination == undefined) ? "Not Provied" : (req.file.destination + "/" + req.file.filename).substring(1)
                }
            }
            req.session.book = tempBook
            setTimeout(() => {
                res.redirect("/addBook")
            }, 1000);
            
        } else {
            // AddBook Page, Book was found, just uploading image
            req.session.book.cover = { large: "" };
            req.session.book.cover.large = (req?.file?.destination == undefined) ? "Not Provied" : (req.file.destination + "/" + req.file.filename).substring(1)
            let bookuuid = await addBook(req.session.user, req.session.book)
            let cats = JSON.parse(JSON.stringify(req.body))
            let categories = []
            try {
                categories = cats.categories.split(",")
            } catch (err) {}
            for (let i = 0; i < categories.length; i++) {
                await addBookToCategory(bookuuid, categories[i], req.session.user)
            }

            delete req.session.book
            res.redirect("/library")
        }
    } catch (err) {
        console.log(err)
        delete req.session.book
        res.redirect("/library")
    }
})
app.post('/library/addBook', async (req, res) => {
    if (!req.session.user) {
        return res.send("afds");
    }
    if (req.body.answerResult) {
        // Add Book
        let bookuuid = await addBook(req.session.user, req.session.book)
        for (let i = 0; i < req.body.categories.length; i++) {
            await addBookToCategory(bookuuid, req.body.categories[i], req.session.user)
        }
        req.session.highlight = bookuuid;
        delete req.session.book
        res.send({error: false})

    } else {
        try {
            if (req.session.book.cover.large.startsWith("/uploads")) { try { fs.unlinkSync("." + req.session.book.cover.large); } catch(err) { console.log(err) } }
        } catch(err) {}
        delete req.session.book;
        res.json({error: false})
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
app.post('/library/editBook', upload.single('image'), async (req, res) => {
    if (!req.session.user) {
        return res.json({error: true});
    }

    try {
        // Image was uploaded
        let imageLocation = req.file.destination + "/" + req.file.filename
        let book = await libraryTags.findOne({ where: { userID: req.session.user, bookUUID: req.body.bookUUID } })
        if (!book) { return res.redirect("/library")}
        if (book.dataValues.imageLink.startsWith("/uploads")) {
            try { // Try to delete stored image
                fs.unlinkSync("." + book.dataValues.imageLink);
            } catch(err) {}
        }
        await book.update({
            title: sanitize(req.body.title),
            author: sanitize(req.body.author),
            imageLink: imageLocation
        })
        await libraryTags.sync()
        req.session.highlight = req.body.bookUUID
        res.redirect("/library")

    } catch (err) {
        // No Image was uploaded
        let book = await libraryTags.findOne({ where: { userID: req.session.user, bookUUID: req.body.bookUUID } })
        if (book) {
            await book.update({
                title: sanitize(req.body.title),
                author: sanitize(req.body.author),
            })
            await libraryTags.sync()
        }
        req.session.highlight = req.body.bookUUID
        res.redirect("/library")
    }
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

    initWardSystem()
    restartNots()
}
initTags();

let backupCron;
async function initBackup() {
    backupCron = cron.schedule("0 0 * * 0", function(){
    
        console.log("Backup Starting") // Sunday at 12am 
        // Add backup code
    })
}
initBackup();


console.log(fs.readFileSync("./src/logo.txt", "utf-8"))


let port = 8080

let override = false; // Use this to force into http mode

// Add the -http argument to force http
if ((process.platform == "linux" && process.argv.length != 3) && !override) {
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

let updater = new AutoUpdater("https://raw.githubusercontent.com/ChickenNuggetsPerson/LibrarySystem/main/package.json", "0 * 0 * * *")

















// Ward Tracker Extension
const trackerSequelizer = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'users/wardData.sqlite',
});
const wardEntryTags = trackerSequelizer.define('wardEntry', {
    actionType: { type: Sequelize.STRING, },
    actionAmt: { type: Sequelize.STRING, },
    memberType: { type: Sequelize.STRING, },
    entryID: { type: Sequelize.STRING, }
});
const wardMessagesTags = trackerSequelizer.define("wardMessage", {
    messageID: { type: Sequelize.STRING },
    content: { type: Sequelize.STRING }
})

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 4,
    message: "Too many requests from this IP, please try again later."
});

let cachedDataPath = "users/wardData_Cached.json"
var cachedData = {
    amt: 0,
    max: 1
}
async function reCalcCache() {

    console.log("Recalculating Ward Cache")

    let entries = await fetchWardEntrys(false)

    cachedData.amt = 0

    entries.forEach(i => {
        let entry = i.dataValues
        cachedData.amt += Number(entry.actionAmt)
    })

    saveCache()
}
async function saveCache() {
    fs.writeFileSync(cachedDataPath, JSON.stringify(cachedData))
}

async function initWardSystem() {
    await wardEntryTags.sync()
    await wardMessagesTags.sync()

    // Inilitalize Cache - Read from disk
    try {
        cachedData = JSON.parse(fs.readFileSync(cachedDataPath))
    } catch (err) {}

}

async function createWardEntry(actionType, actionAmt, memberType) {
    let id = uuidv4()
    await wardEntryTags.create({
        actionType: actionType,
        actionAmt: actionAmt,
        memberType: memberType,
        entryID: id
    })
    await wardEntryTags.sync();
    console.log("Created Ward Entry: " + id)
    reCalcCache()
}
async function deleteWardEntry(uuid) {
    console.log("Deleting Ward Entry: " + uuid)

    await wardEntryTags.sync();
    await wardEntryTags.destroy({where: {
        entryID: uuid,
    }})
    .then(function(rowDeleted){
        wardEntryTags.sync();
    }, function(err){
        console.log(err);
        wardEntryTags.sync(); 
    });
    reCalcCache()
}
async function editWardEntry(uuid, actionType, actionAmt, memberType) {
    let entry = await wardEntryTags.findOne({ where: { entryID: uuid } })
    if (entry) {
        await entry.update({
            actionType: actionType,
            actionAmt: actionAmt,
            memberType: memberType,
        })
        await wardEntryTags.sync()

        reCalcCache()

        return true;
    }
    return false;
}
async function fetchWardEntrys(stripSensitiveData) {
    if (!stripSensitiveData) {
        return (await wardEntryTags.findAll()).reverse()
    }

    let entries = await wardEntryTags.findAll({
        order: [
            ["createdAt", "DESC"]
        ],
        limit: 5
    })
    var newArr = []

    entries.forEach(e => {
        newArr.push({
            actionType: e.dataValues.actionType,
            actionAmt: e.dataValues.actionAmt,
            memberType: e.dataValues.memberType,
            id: e.dataValues.entryID.substring(0, 5)
        })
    })

    return newArr.reverse()
}


async function createWardMessage(message) {
    let id = uuidv4()
    await wardMessagesTags.create({
        messageID: id,
        content: message
    })
    await wardMessagesTags.sync()
    console.log("Created Ward Message: " + id)
}
async function deleteWardMessage(messageID) {
    console.log("Deleting Ward Message: " + messageID)

    await wardMessagesTags.sync();
    await wardMessagesTags.destroy({where: {
        messageID: messageID,
    }})
    .then(function(rowDeleted){
        wardMessagesTags.sync();
    }, function(err){
        console.log(err);
        wardMessagesTags.sync(); 
    });
}
async function getAllWardMessages() {
    return await wardMessagesTags.findAll({
        order: [
            ["createdAt", "DESC"]
        ],
        limit: 15
    })
}
async function getWardMessage(uuid) {
    return await wardMessagesTags.findOne({
        where: {
            messageID: uuid
        }
    })
}



// Ward Tracker Get Functions
app.get('/wardTracker/progress', (req, res) => {
    res.json(cachedData)
});


// Ward Tacker Pages
app.get('/wardTracker/pages/:pageName', (req, res) => {
    
    if (req.session.isAdmin) {
        res.render("wardTracker/" + req.params.pageName, {
            isAdmin: "true",
            versionNum: JSON.stringify(updater.currentVersion)
        })
    } else {
        res.render("wardTracker/" + req.params.pageName, {
            isAdmin: "false",
            versionNum: JSON.stringify(updater.currentVersion)
        })
    }
});


// Validation Functions
let entryRangeAmt = {
    min: 1,
    max: 10
}
let memberTypes = [
    "Adult",
    "Youth",
    "Primary"
]



// Ward Tracker Entry Functions
app.get('/wardTracker/entries/acceptableVals', async (req, res) => {
    res.json({
        actionRange: entryRangeAmt,
        memberTypes: memberTypes
    })
})
app.get('/wardTracker/entries/list', async (req, res) => {
    res.json(await fetchWardEntrys(false))
})
app.use('/wardTracker/entries/submit', limiter);
app.post('/wardTracker/entries/submit', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    
    try {
        // Validate Values
        if (!req.body.actionType) {
            print("action")
            return res.json({error: true});
        }
        if (
            req.body.actionAmt < entryRangeAmt.min || req.body.actionAmt > entryRangeAmt.max
        ) {
            print("amt")
            return res.json({error: true});
        }
        if (!memberTypes.includes(req.body.memberType)) {
            print("type")
            return res.json({error: true});
        }

        await createWardEntry(
            req.body.actionType,
            req.body.actionAmt,
            req.body.memberType
        )
    } catch (err) {
        return res.json({error: true});
    }

    res.json({error: false});
})


// Admin Endpoints
app.get('/wardTracker/admin/entries/list', async (req, res) => {
    // if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }

    if (!req.session.isAdmin) {
        return res.json({error: true});
    }

    res.json(await fetchWardEntrys(false))
})
app.post('/wardTracker/admin/entries/delete', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }

    if (!req.session.isAdmin) {
        return res.json({error: true});
    }

    try {
        await deleteWardEntry(req.body.uuid)
    } catch (err) {
        return res.json({error: true});
    }

    res.json({error: false});
})
app.post('/wardTracker/admin/messages/edit', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    
    try {
        // Validate Values
        if (!req.body.actionType) {
            print("action")
            return res.json({error: true});
        }
        if (!memberTypes.includes(req.body.memberType)) {
            print("type")
            return res.json({error: true});
        }

        if (!req.body.actionType) {
            print("action")
            return res.json({error: true});
        }

        if (!req.body.uuid) {
            print("uuid")
            return res.json({error: true});
        }

        return res.json({error: 
            !(await editWardEntry(req.body.uuid, req.body.actionType, req.body.actionAmt, req.body.memberType))
        });

    } catch (err) {
        return res.json({error: true});
    }

})

app.post('/wardTracker/admin/newMax', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }

    // if (!req.session.isAdmin) {
    //     return res.json({error: true});
    // }

    try {
        let newMax = Number(req.body.newMax)
        cachedData.max = newMax
        await reCalcCache()

    } catch (err) {
        return res.json({error: true});
    }

    res.json({error: false});
})



app.get('/wardTracker/messages/list', async (req, res) => {
    res.json(await getAllWardMessages())
})
app.use('/wardTracker/messages/create', limiter);
app.post('/wardTracker/messages/create', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }
    
    try {
        // Validate Values
        if (!req.body.messageContent) {
            return res.json({error: true});
        }
        if (req.body.messageContent.trim() == "") {
            return res.json({error: true});
        }

        await createWardMessage(req.body.messageContent)
    } catch (err) {
        return res.json({error: true});
    }

    res.json({error: false});
})


app.post('/wardTracker/admin/messages/delete', async (req, res) => {
    if (!req.headers.host.startsWith("library.steeleinnovations.com") && !req.headers.host.startsWith("localhost")) { return res.sendStatus(404) }

    if (!req.session.isAdmin) {
        return res.json({error: true});
    }

    try {
        let id = req.body.messageID
        await deleteWardMessage(id)
    } catch (err) {
        return res.json({error: true});
    }

    res.json({error: false});
})