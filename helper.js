const fs = require('fs')
const find = require('find')

function readFile(path, opts = 'utf8') {
  return new Promise((res, rej) => {
    fs.readFile(path, opts, (err, data) => {
        if (err) rej(err)
        else res(data)
    })
  })
}

function writeFile(path, data, opts = 'utf8') {
  return new Promise((res, rej) => {
    fs.writeFile(path, data, opts, (err) => {
        if (err) rej(err)
        else res()
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

module.exports = {
    readFile,
    writeFile,
    readDir,
    findFile,
    makeDir,
}
