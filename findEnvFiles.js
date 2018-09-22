const find = require('find')
const helper = require('./helper')

async function findEnvFiles(workingDir) {
  let transformed = []

  const toTransform = await helper.findFile(/\.env/, workingDir)
    .catch(err => {
      throw err
    })

  toTransform.forEach(el => {
    let indexOfSlash = el.lastIndexOf('/')
    let lengthOfString = el.length
    let slicedString = el.slice(indexOfSlash + 1, lengthOfString)
    transformed.push(slicedString)
  })

  return transformed
}

module.exports = {
  findEnvFiles
}