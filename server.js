const express=require('express')
const app=express()
const bodyparser = require('body-parser');
const request = require('express');
const MongoClient= require('mongodb').MongoClient
var db;
var n;
MongoClient.connect('mongodb://Localhost:27017/ElectronicInventory',(err,database)=>{
    if(err) return console.log(err)
    db=database.db('ElectronicInventory')
    app.listen(2021,() =>{
        console.log('Listening to port number 2021')
    })
})

app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use(express.static('public'))

app.get('/',(req,res)=>{
    db.collection('phones').find().toArray( (err,result)=>{
        if(err) return console.log(err)
    res.render('Home.ejs', {
            data: result, 
            sum: 0
        });
    })
})

app.get('/create',(req,res)=>{
    res.render('add.ejs')
})

app.get('/update',(req,res)=>{
    res.render('update.ejs')
})

app.get('/delete',(req,res)=>{
    res.render('delete.ejs')
})

app.post('/AddData',(req,res)=>{
    db.collection('phones').save(req.body, (err, result)=>{
        if(err) return console.log(err)
    res.redirect('/')
    })
})

app.post('/update',(req,res)=>{
    db.collection('phones').find().toArray((err,result) => {
        if(err) return console.log(err)
        for(var i=0;i<result.length;i++){
            if(result[i].pid==req.body.pid){
                var s=result[i].stock
                break
            }
        }
        db.collection('phones').findOneAndUpdate({pid:req.body.pid},{
        $set: {stock:parseInt(s)+parseInt(req.body.stock)}},{sort:{ id:-1}},
        (err,result)=>{
            if(err) return res.send(err)
         console.log(req.body.pid+' Stock updated')
         res.redirect('/')
    })
})
})

app.post('/delete',(req,res)=>{
    db.collection('phones').findOneAndDelete({pid:req.body.pid},(err,result)=>{
        if(err) console.log(err)
        console.log(req.body.pid+' stock deleted')
    res.redirect('/')
    })
})