var cache     = require('./cacheLayer/index.js')
    fs        = require('fs'),
    http      = require('http'),
    humanize  = require('humanize-number'),
    stringify = require('json-stringify-safe'),
    Log       = require('log'),
    log       = new Log('debug',fs.createWriteStream('/var/log/dockerico.log')),
    minix     = require('minix'),
    path      = require('path'),
    swig      = require('swig')

var imgProps = {
  "width": 350,
  "height": 112,
  "margin": 14
}

swig.setDefaults({
  root: path.join(__dirname,"svg")
})

swig.setFilter("humanize",humanize)

var badge = swig.compileFile(path.join(__dirname+"/svg/docker-badge.svg"))

minix.newEndpoint("/image/",function(req,res) {
  var url = req.url.split("/")
  if(url.length!==4) return serverError(req,res,422,"malformed url")
  cache.get(url[2],url[3],function(e,props) {
    if(e) return serverError(req,res,503,e)
    res.setHeader("Content-Type","image/svg+xml")
    props.name = url[2]+"/"+url[3]
    console.log(props)
    res.end(badge(props))
  })
})

minix.setFallback(function(req,res) {
  res.writeHead(307, {
    "location" : "http://technotip.org",
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
