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

app.get('/blog/:userid', async (req, res) => {
    const found = await newdb.findOne({_id: req.params.userid});
    res.render('blog',{arr: found.docs, id: found._id});
})

app.get('/create/:id', (req, res) => {
    res.render('create',{id: req.params.id});
})

app.post('/create/:id', async(req, res) => {
    const currentDate = new Date();

    const body = {
        _id: Math.random().toString(16).slice(2),
        title: req.body.title,
        post: req.body.blog,
        date: currentDate.toDateString(),
    }
    await newdb.updateAsync({_id: req.params.id}, {$push: {docs: body}})
    const found = await newdb.findAsync({_id: req.params.id});
    res.render('blog',{arr: found[0].docs, id: req.params.id});
})

app.get('/exploreposts/:userid/blogs/:blogid',async (req, res)=>{
    const user = await newdb.findAsync({_id: req.params.userid});
    user[0].docs.forEach(item =>{
        if(item._id === req.params.blogid){
            res.render('explore-post',{item: item});
        }
    })
    res.end();
})

app.get('/posts/:userid/blogs/:blogid',async (req, res)=>{
    const user = await newdb.findAsync({_id: req.params.userid});
    user[0].docs.forEach(item =>{
        if(item._id === req.params.blogid){
            res.render('post',{item: item, id: req.params.userid});
        }
    })
    res.end();
})

app.get('/delete/:userid/blogs/:blogid', async (req, res)=>{
    const found = await  newdb.findOne({_id: req.params.userid});
    found.docs = found.docs.filter(item => item._id !== req.params.blogid);
    await newdb.update({_id: req.params.userid},found);
    res.redirect(`/blog/${req.params.userid}`);
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    const found = await newdb.findAsync({username: req.body.username});
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

app.get('/explore', async (req, res) => {
    const blogs = await newdb.findAsync({});
    const arr = [];
    blogs.forEach(user => {
        const userid = user._id;
        user.docs.forEach(item => {
            item.userId = userid;
            arr.push(item);
        })
    })
    arr.sort(()=>Math.random() - 0.5);
    res.render('explore', {arr: arr});
})