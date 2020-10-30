//本模组用于获得access token
var getAccessToken = function(){
    console.log("Requesting access token from wx")
    const https = require('https')
    
    const defaultV = "client_credential";
    const appid = "wx74aa0a8d95193b59";
    const secret = "826b71a74e8ae97627fc593dce2fee55";
    
    const url = "https://api.weixin.qq.com/cgi-bin/token?grant_type="+defaultV+"&appid="+appid+"&secret="+secret; 

    return new Promise(function(resolve,reject){
        const req = https.get(url,function(response_fromAPI){ 
            response_fromAPI.on("data", function(data){
                resolve(JSON.parse(data).access_token)
            })
        })
        // 不确定这样handle error是否正确，教程在 https://nodejs.dev/learn/make-an-http-post-request-using-nodejs
        req.on("error",function(error){
            console.log("Failed to update token:", error)
            reject(error)
        })
    })
}

exports.getAccessToken = getAccessToken