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

app.listen(3000, () => console.log("Server started in port 3000"));

app.get('/', async (req, res) => {
    const docs = await database.findAsync({});
    res.render('home',{arr: docs});
})

app.get('/create', (req, res) => {
    res.render('create');
})

app.post('/create', (req, res) => {
    const currentDate = new Date();

    const body = {
        title: req.body.title,
        post: req.body.blog,
        date: currentDate.toDateString()
    }
    database.insert(body);
    res.redirect('/');
})

app.get('/posts/:id',async (req, res)=>{
    const arr = await database.findAsync({});
    arr.forEach(item => {
        if(item.title === req.params.id){
        
        const title = item.title;
        const post = item.post;
        const date = item.date;
    
        res.render("post", {title: title, post: post, date:date});
        }
    })
})