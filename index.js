let rp = require('request-promise')
let Promise = require('bluebird')
let _ = require('lodash')

let config = {
  getSeedOptions(email) {
    let options = {
      uri: 'https://hr.tuputech.com/recruit/v2/tree/user',
      method: 'POST',
      form: {
        // Like <input type="text" name="name">
        email
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'host': 'hr.tuputech.com',
        'origin': 'https://hr.tuputech.com',
        'referer': 'https://hr.tuputech.com/recruit/tree',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      }
    }
    return options
  },
  getDataOptions(seedInfo) {
    let options = {
      uri: `http://hr.tuputech.com/recruit/v2/tree?seed=${seedInfo.seed}`,
      method: 'GET',
      headers: {
        'host': 'hr.tuputech.com',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
      }
    }
    return options
  },
  getAnswerOptions(item) {
    let options = {
      uri: `https://hr.tuputech.com/recruit/tree/${item.type}`,
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'host': 'hr.tuputech.com',
        'origin': 'https://hr.tuputech.com',
        'referer': 'https://hr.tuputech.com/recruit/tree',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      }
    }
    return options
  },
  getSubmitAnswerOptions(answer) {
    let options = {
      uri: 'https://hr.tuputech.com/recruit/v2/tree',
      method: 'POST',
      body: answer,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'host': 'hr.tuputech.com',
        'origin': 'https://hr.tuputech.com',
        'referer': 'https://hr.tuputech.com/recruit/tree',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      },
      json: true
    }
    return options
  },
  getFruitOptions(fruit, seed) {
    let options = {
      uri: 'https://hr.tuputech.com/recruit/v2/tree/success',
      method: 'POST',
      form: {
        // Like <input type="text" name="name">
        fruit,
        seed
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'host': 'hr.tuputech.com',
        'origin': 'https://hr.tuputech.com',
        'referer': 'https://hr.tuputech.com/recruit/tree',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      }
    }
    return options
  }
}

async function getAnswer(data, seedInfo) {
  data = _.cloneDeep(data)
  delete data.success
  data.seed = seedInfo.seed
  let child = [data.tree]
  let promiseArr = []
  let cache = {}
  function resolveData(child) {
    for (let item of child) {
      if (cache[item.type]) {
        item.result = cache[item.type]
        delete item.type
        delete item.level
      } else {
        let options = config.getAnswerOptions(item)
        let res = rp(options).then(data => {
          item.result = data
          cache[item.type] = data
          delete item.type
          delete item.level
        })
        promiseArr.push(res)
      }
      resolveData(item.child)
      // process.nextTick(resolveData.bind(this, item.child))
    }
  }
  resolveData(child)
  await Promise.all(promiseArr)

  data.result = child[0]
  delete data.tree
  return data
}

const EMAIL = 'dd123@qqqs.com';

(async function main() {
  let seedOptions = config.getSeedOptions(EMAIL)
  // get seed
  let seedInfo = await rp(seedOptions)
  seedInfo = JSON.parse(seedInfo)
  let dataOptions = config.getDataOptions(seedInfo)
  // // get question data
  let data = await rp(dataOptions)
  data = JSON.parse(data)
  let answer = await getAnswer(data, seedInfo)
  let submitAnswerOptions = config.getSubmitAnswerOptions(answer)
  let result = await rp(submitAnswerOptions)
  console.log(result)
})()
