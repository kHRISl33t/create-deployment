const fs = require('fs')
const find = require('find')

function readFile(path, opts = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
        if (err) reject(err)
        else resolve(data)
    })
  })
}

function writeFile(path, data, opts = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, opts, (err) => {
        if (err) reject(err)
        else resolve()
    })
  })
}

function findFile(pattern, dir) {
  return new Promise((resolve, reject) => {
    find.file(pattern, dir, files => {
      if (!files.length) {
        reject(`There is no .env file in the given project folder: ${dir}`)
      }
      resolve(files)
    })
  })
}

function makeDir(dirname) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirname, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

async function findEnvFiles(workingDir) {
  let transformed = []

  const toTransform = await findFile(/\.env/, workingDir)
    .catch(err => {
      return err
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
  readFile,
  writeFile,
  findFile,
  makeDir,
  findEnvFiles
}
