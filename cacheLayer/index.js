var levelup = require('levelup'),
    epoch   = require('milli-epoch'),
    scrapper  = require('../scrapper/index.js')

var db = levelup("./cache",{'keyEncoding':'json'})
var timeout = 60*5 //seconds

var cache = module.exports = {}
cache.get = function(namespace,repo,cb) {
  cb = cb || function() {}
  db.get(namespace+"/"+repo,function(e,val) {
    if(e) {
      if(e.notFound) {
        return cacheMiss(namespace,repo,cb)
      } else {
        return cb(e)
      }
    }
    val = JSON.parse(val)
    if(isExpired(val.expires)) {
      cacheMiss(namespace,repo)
    }
    return cb(null,val)
  })
}

function cacheMiss(namespace,repo,cb) {
  cb = cb || function() {}
  scrapper(namespace,repo,function(e,props) {
    if(e) return cb(e)
    props.expires = getFuture(timeout)
    db.put(namespace+"/"+repo,JSON.stringify(props),function(e) {
      if(e) {}// log
    })
    return cb(null,props)
  })
}

function getFuture(seconds) {
  return epoch.now() + (1000*seconds)
}

function isExpired(timestamp) {
  return ( timestamp - epoch.now() ) < 0
}
