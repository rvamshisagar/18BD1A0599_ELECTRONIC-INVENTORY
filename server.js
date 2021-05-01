const express=require('express')
const app=express()
const bodyparser = require('body-parser');
const request = require('express');
const MongoClient= require('mongodb').MongoClient
const fs=require("fs");
const json2xls= require("json2xls");
var db;
var n;

MongoClient.connect('mongodb://Localhost:27017/ElectronicInventory',(err,database)=>{
    if(err) return console.log(err)
    db=database.db('ElectronicInventory')
    app.listen(1021,() =>{
        console.log('Listening to port number 1021')
    })
})

app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use(express.static('public'))

app.get('/',(req,res)=>{
    db.collection('phones').find().toArray( (err,result)=>{
        if(err) return console.log(err)
    fs.writeFile("public/phones.json",JSON.stringify(result,null,4),(err)=>{
        if(err){
            console.log(err);
        }
    })
    xls=json2xls(result);
    fs.writeFile("public/phones.xlsx",xls,'binary',(err)=>{
        if(err){
            console.log(err);
        }
    })
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
    const pid=req.query.pid
    res.render('update.ejs',{
        id:pid
    })
})

app.get('/delete',(req,res)=>{
    const pid=req.query.pid 
    res.render('delete.ejs',{
        id:pid
    })
})

app.post('/AddData',(req,res)=>{
    let values=Object.keys(req.body);
    for(let i=0;i<values.length;i++){
        if(req.body[values[i]]==""){
            res.render('add.ejs')
        }
    }
    db.collection('phones').save(req.body, (err, result)=>{
        if(err) return console.log(err)
    res.redirect('/')
    })
})

app.post('/updateData',(req,res)=>{
    let values=Object.keys(req.body);
    let b=false;
    for(let i=0;i<values.length;i++){
        if(req.body[values[i]]==""){
            b=true;
        }
    }
    if(b==true){
        res.redirect('/update')
    }
    else{
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
    }
})

app.post('/deleteData',(req,res)=>{
    if(req.body.pid==""){
        res.redirect('/delete')
    }
    else{
        db.collection('phones').findOneAndDelete({pid:req.body.pid},(err,result)=>{
            if(err) console.log(err)
            console.log(req.body.pid+' stock deleted')
        res.redirect('/')
        })
    }
})

