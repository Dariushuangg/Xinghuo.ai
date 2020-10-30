//本模组用于测试
var getDrivingScore = function(openId,temp_access_token){
    // const https = require('https')
    // axios是一个强大的https相关的NPM库
    const axios = require('axios')
    
    const access_token = temp_access_token;
    const env = "cloud1-nhw9y";
    const name = "getDrivingScore";
    
    const url = "https://api.weixin.qq.com/tcb/invokecloudfunction?access_token="+access_token+"&env="+env+"&name="+name; 

    return new Promise((resolve,reject)=>{
        axios.post(url, {
            "openId": openId
            }).then(res => {resolve(res)}).catch(error => {
            console.error(error)
            reject(error)
            })
    })
}

exports.getDrivingScore = getDrivingScore