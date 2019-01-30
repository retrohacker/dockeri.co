const svg = require('@architect/views/svg.js')
var get = require('request-promise-native')
const api = 'https://hub.docker.com/v2/repositories'

module.exports = async function badge(namespace, image) {
  let url = `${api}/${namespace || 'library'}/${image}/`
  let res
  try {
    console.log('fetching stats')
    res = JSON.parse(await get(url))
    console.log(res)
  } catch(e) {
    console.log(e)
    return {
      status: 500
    }
  }

  const name = namespace ? `${namespace}/${image}` : image
  const stars = res.star_count
  const downloads = res.pull_count
  const trusted = res.is_automated

  try {
    console.log('fetching comments')
    res = JSON.parse(await get(url + 'comments/'))
    console.log(res)
  } catch(e) {
    console.log(e)
    return {
      status: 500
    }
  }

  const comments = res.count

  return {
    type: 'image/svg+xml; charset=utf8',
    body: svg(name, stars, downloads, comments, trusted)
  }
}
