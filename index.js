var cache     = require('./cacheLayer/index.js')
    fs        = require('fs'),
    http      = require('http'),
    humanize  = require('humanize-number'),
    isdev     = require('isdev'),
    levelup   = require('levelup'),
    Log       = require('log'),
    minix     = require('minix'),
    path      = require('path'),
    stringify = require('json-stringify-safe'),
    swig      = require('swig')

var imgProps = {
  "width": 350,
  "height": 82,
  "margin": 14
}

//Where do we put log files?
var logPath = (isdev) ? __dirname : path.join('var','log')
var log = new Log('debug',fs.createWriteStream(path.join(logPath,'dockerico.log'))

//Keep track of all errors encountered
var errors = levelup(path.join(logPath,'errors'),{'keyEncoding':'json'})

//Keep track of all requests made
var requests = levelup(path.join(logPath,'reqs'),{'keyEncoding':'json'})

//Keep track of badges served
var badges = levelup(path.join(logPath,'badges'),{'keyEncoding':'json'})

var reqCount = Date.now()
var badgeCount = Date.now()
var errorCount = Date.now()

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
  cache.get(url[2],url[3],function(e,props) {
    if(e) {
      HandleError(e,req)
      return serverError(req,res,503,e)
    }
    badges.put(badgeCount++,stringify({namespace:url[2],repo:url[3],time:Date.now()}),function(e) {
      if(e) return HandleError(e,req)
    })
    res.setHeader("Content-Type","image/svg+xml")
    props.name = url[2]==='_'?url[3]:url[2]+"/"+url[3];
    res.end(badge(props))
  })
})

minix.newEndpoint("/requests",function(req,res) {
  jsonArrayStream(requests.createValueStream(),res)
})

minix.newEndpoint("/errors",function(req,res) {
  jsonArrayStream(errors.createValueStream(),res)
})

minix.newEndpoint("/badges",function(req,res) {
  jsonArrayStream(badges.createValueStream(),res)
})

minix.newEndpoint("/served",function(req,res) {
  getStreamCount(badges.createValueStream(),function(e,count) {
    if(e) {
      log.error(e)
      res.statusCode = 500
      return res.end(stringify(e))
   }
   res.end(count.toString())
  })
})

function getStreamCount(src,cb) {
  var count = 0
  src
    .on('data',function() {
      count++
    })
    .on('error',function(e) {
      cb(e)
    })
    .on('end',function() {
      cb(null,count)
    })
}

function jsonArrayStream(src,dst) {
  dst.setHeader("Content-Type","application/json")
  dst.write("{\"values\":[")
  var prev = null
  src
    .on('data',function(data) {
      if(prev) dst.write(prev+",")
      prev = data
    })
    .on('error',function(e) {
      if(prev) dst.write(prev)
      dst.write("],err:"+stringify(e)+"}")
    })
    .on('end',function() {
      if(prev) dst.write(prev)
      dst.end("]}")
    })
}

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
