const express = require('express')
const https = require('https')
const app = express()
const bodyParser = require('body-parser')
let temp_access_token = '' 

setInterval(()=>{
    var getAccessToken = require('./getAccessToken')
    var access_token = getAccessToken.getAccessToken()
    access_token.then((get_access_token)=>{temp_access_token = get_access_token
    console.log(temp_access_token)})
},10*1000)//每71990秒更新一次


// bodyParser is necessary to convert url-encoded data to json-formatted data
app.use(bodyParser.json())
app.post("/score",function(req,res){
    var openId = req.body.query_openId
    var getDrivingScore = require('./getDrivingScore')
    var DrivingScore = getDrivingScore.getDrivingScore(openId,temp_access_token)
    DrivingScore.then((get_DrivingScore)=>{res.send(get_DrivingScore.data)})

    // DrivingScore.then((get_DrivingScore)=>{res.send(get_DrivingScore)})
});

app.get('',function(req,res){
    res.send(temp_access_token)
})

app.listen(9000,()=>{console.log("Server start 9000")})