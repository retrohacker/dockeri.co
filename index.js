var cache     = require('./cacheLayer/index.js')
    fs        = require('fs'),
    http      = require('http'),
    humanize  = require('humanize-number'),
    isdev     = require('isdev'),
    levelup   = require('levelup'),
    Log       = require('log'),
    log       = new Log('debug',fs.createWriteStream((isdev) ?
                                                     './dockerico.log' :
                                                     '/var/log/dockerico.log')),
    minix     = require('minix'),
    path      = require('path'),
    stringify = require('json-stringify-safe'),
    swig      = require('swig')

var imgProps = {
  "width": 350,
  "height": 82,
  "margin": 14
}

//Keep track of all errors encountered
var errors = levelup('./errors',{'keyEncoding':'json'})

//Keep track of all requests made
var requests = levelup('./reqs',{'keyEncoding':'json'})

//Keep track of b)adges served
var badges = levelup('./badges',{'keyEncoding':'json'})

var reqCount = 0
var badgeCount = 0
var errorCount = 0

swig.setDefaults({
  root: path.join(__dirname,"svg")
})

swig.setFilter("humanize",humanize)

var badge = swig.compileFile(path.join(__dirname+"/svg/docker-badge.svg"))

minix.newEndpoint("/image/",function(req,res) {
  requests.put(reqCount++,stringify({time:Date.now(),req:req}),function(e){
    if(e) return HandleError(e,req)
  })
  var url = req.url.split("/")
  if(url.length!==4) {
    HandleError(new Error("malformed url"),req)
    return serverError(req,res,422,"malformed url")
  }
  badges.put(badgeCount++,stringify({namespace:url[2],repo:url[3],time:Date.now()}),function(e) {
    if(e) return HandleError(e,req)
  })
  cache.get(url[2],url[3],function(e,props) {
    if(e) {
      HandleError(e,req)
      return serverError(req,res,503,e)
    }
    res.setHeader("Content-Type","image/svg+xml")
    props.name = url[2]==='_'?url[3]:url[2]+"/"+url[3];
    res.end(badge(props))
  })
})

minix.newEndpoint("/requests",function(req,res) {
  res.setHeader("Content-Type","application/json")
  requests.createValueStream().pipe(res)
})

minix.newEndpoint("/errors",function(req,res) {
  res.setHeader("Content-Type","application/json")
  errors.createValueStream().pipe(res)
})

minix.newEndpoint("/badges",function(req,res) {
  res.setHeader("Content-Type","application/json")
  badges.createValueStream().pipe(res)
})

minix.setFallback(function(req,res) {
  res.writeHead(307, {
    "location" : "https://registry.hub.docker.com/u/wblankenship/dockeri.co",
    "Content-Type" : "text/html"
  });
  res.end("<html><head><title>Moved</title></head><body><a href='https://registry.hub.docker.com/u/wblankenship/dockeri.co/'>https://registry.hub.docker.com/u/wblankenship/dockeri.co/</a></body><html>")
})

http.createServer(function(req,res) {
  minix(req.url)(req,res)
}).listen(8888,"0.0.0.0")

function serverError(req,res,code,msg) {
  res.setHeader("Content-Type","text/json")
  var obj = {
    "code": code,
    "msg": msg.message,
  }
  res.statusCode = code
  res.end(stringify(obj,null," "))
  obj.req = req
  log.error(stringify(obj,null," "))
}

function HandleError(e,req) {
  log.error(stringify(e,null," "))
  var obj = {e:e,time:Date.now(),req:req}
  errors.put(errorCount++,stringify(obj),function(e) {
    if(e) {
      log.error("UNABLE TO LOG ERROR!")
      return log.error(stringify(e,null," "))
    }
  })
}
