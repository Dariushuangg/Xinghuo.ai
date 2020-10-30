//本模组用于获得access token
var getAccessToken = function(){
    console.log("Requesting access token from wx")
    const https = require('https')
    
    const defaultV = "client_credential";
    const appid = "";
    const secret = "";
    
    const url = "https://api.weixin.qq.com/cgi-bin/token?grant_type="+defaultV+"&appid="+appid+"&secret="+secret; 

    return new Promise(function(resolve,reject){
        const req = https.get(url,function(response_fromAPI){ 
            response_fromAPI.on("data", function(data){
                resolve(JSON.parse(data).access_token)
            })
        })
        req.on("error",function(error){
            console.log("Failed to update token:", error)
            reject(error)
        })
    })
}

exports.getAccessToken = getAccessToken
