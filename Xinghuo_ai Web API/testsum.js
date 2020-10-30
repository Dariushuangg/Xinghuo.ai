//本模组用于测试
var getDrivingScore = function(openId,temp_access_token){
    const https = require('https')
    
    const access_token = temp_access_token;
    const env = "cloud1-nhw9y";
    const name = "sum";
    
    const url = "https://api.weixin.qq.com/tcb/invokecloudfunction?access_token="+access_token+"&env="+env+"&name="+name; 
    console.log("url",url)
    console.log("query for openId's record",openId)
    return new Promise(function(resolve,reject){
        https.get(url,function(response_fromAPI){ 
            response_fromAPI.on("data", function(data){
                resolve(JSON.parse(body))
            })
        })
    })
}

exports.getDrivingScore = getDrivingScore