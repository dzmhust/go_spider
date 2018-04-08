var request = require('request');
var fs = require('fs');
var path = require('path')
var sprintf = require("sprintf-js").sprintf;
//都改成pc客户端抓包，fiddler抓包
var spiderListUrl = "http://happyapp.huanle.qq.com/cgi-bin/CommonMobileCGI/TXWQFetchChessList?type=4&lastCode=%s&FindUserName=%s&uid=7708756";
var spiderDetailUrl = "http://happyapp.huanle.qq.com/cgi-bin/CommonMobileCGI/TXWQFetchChess?chessid=";

async function spideryehu(name, startdate = '', enddate = '') {
    var info = "";
    var base64name = new Buffer(name).toString('base64');
    var chessidList = await spiderlist(base64name,startdate,enddate);
    if( chessidList.length === 0 ) {
        info = "该时间段该棋手无棋谱！";
        return info;
    }else {
        var persiondir = '../data/yehu/' + name;
        var filepath = path.join(__dirname, persiondir);
        fs.exists(filepath, function(exists) {  
            if( !exists ){
                fs.mkdir(filepath,function(err){
                    if (err) {
                        return console.error(err);
                    }
                    console.log("目录创建成功:" + filepath);
                });
            } 
        });  
    }
    for(var i = 0, l = chessidList.length; i < l; i++) {
        var chessid = chessidList[i];
        var chessname = persiondir + '/' + chessid + '.sgf';
        var chesspath = path.join(__dirname, chessname);
        var data = await spiderdetail(chessid);
        if( data === false ){
            continue;
        }
        fs.writeFile(chesspath, data,  function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据写入成功！ filename : " + chesspath);
            info += "数据写入成功！ filename : " + chesspath + "<br/>";
        });
    }
    return info;
}

//抓取棋手的对局列表
async function spiderlist(name, startdate = '', enddate = '') {
    var list = [];
    var lastCode = '';
    var startunix = new Date(startdate).getTime();
    var endunix = (enddate.length > 0) ? new Date(enddate).getTime() : new Date().getTime();
    console.log(startunix);
    console.log(endunix);
    while(true) {
        var tmplist = await spiderbypage(name,lastCode);
        if( tmplist === false ) {
            continue;
        }
        console.log('hhhhh', tmplist.length);
        var count = tmplist.length;
        var lastTmp = tmplist[count - 1];
        lastCode = lastTmp.chessid;
        tmplist.forEach(element => {
            var tmpunix = element.gamestarttime * 1000;
            if( tmpunix >= startunix && tmpunix <= endunix ) {
                list.push(element.chessid);
            }
        });
        if( tmplist.length < 100 ) {
            console.log('break');
            break;
        }
    }
    return list;
}
//抓取某局棋谱
async function spiderbypage(name,lastCode){
    var result = [];
    url = sprintf(spiderListUrl,lastCode,name);
    console.log('url:', url);
    result = await new Promise(function (resolve, reject) {
        request.get(url, {timeout: 5000}, function(error, response, body) {
        //request.post({url:spiderListUrl,form:params}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                if( data.chesslist && data.chesslist.length > 0 ) {
                   resolve(data.chesslist);
                }else{
                    console.log("spider url empty : " + url);
                    resolve(false);
                }
            }else{
                console.log("spider url error : " + url);
                resolve(false);
            }
        });
    }) 
    return result;
}

async function spiderdetail(chessid) {
    var url = spiderDetailUrl + chessid;
    result = await new Promise(function (resolve, reject) {
        request.get(url, {timeout: 5000}, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                if( data.chess && data.chess.length > 0 ) {
                    resolve(data.chess);
                }else{
                    console.log("spider url empty : " + url);
                    resolve(false);
                }
            }else{
                console.log("spider url error : " + url);
                resolve(false);
            }
        });
    }) 
    return result;
}

module.exports = spideryehu;
//spiderlist('柯洁','2018-01-01','');
// spiderdetail('1521791117010001388').then((data) => {
//     console.log(data);
// })
//spideryehu('晚风残','2016-01-01','');