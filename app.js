import express, { response } from "express";
import ejs from "ejs"
import bodyParser from "body-parser"
import Datastore from "@seald-io/nedb"

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

const database = new Datastore({filename: 'database.db'});
database.loadDatabase();

const newdb = new Datastore({filename: 'login.db'});
newdb.loadDatabase();

app.listen(3000, () => console.log("Server started in port 3000"));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/blog', async (req, res) => {
    const docs = await database.findAsync({});
    res.render('blog',{arr: docs});
})

app.get('/create/:id', (req, res) => {
    res.render('create',{id: req.params.id});
})

app.post('/create/:id', async(req, res) => {
    const currentDate = new Date();

    const body = {
        title: req.body.title,
        post: req.body.blog,
        date: currentDate.toDateString()
    }
    await newdb.updateAsync({_id: req.params.id}, {$push: {docs: body}})
    const found = await newdb.findAsync({_id: req.params.id});
    console.log(found[0]);
    res.render('blog',{arr: found[0].docs, id: req.params.id});
})

app.get('/posts/:id',async (req, res)=>{
    const item = await database.findAsync({_id: req.params.id});
    res.render('post', {item: item[0]});
})

app.get('/delete/:id', async (req, res)=>{
    const numRemoved = await database.removeAsync({_id: req.params.id}, {});
    res.redirect('/');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    const found = await newdb.findAsync({username: req.body.username});
    console.log(found);
    if(found.length === 0){
        res.redirect('/register');
    }
    else{
        if(req.body.password === found[0].password){
            res.render('blog',{arr: found[0].docs, id: found[0]._id});
        }
        else{
            res.redirect('/login');
        }
    }
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', (req, res) => {
    const entry = {
        username: req.body.username,
        password: req.body.password,
        docs:[],
    }
    newdb.insert(entry);
    res.redirect('/login');
})