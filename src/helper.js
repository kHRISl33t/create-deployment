/* eslint-disable prefer-promise-reject-errors */

'use strict'

const fs = require('fs')
const find = require('find')
const shell = require('shelljs')

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
    find.file(pattern, dir, (files) => {
      if (!files.length) {
        reject()
      }
      resolve(files)
    })
  })
}

function makeDir(dirname) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirname, (err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

async function findEnvFiles(workingDir) {
  const transformed = []
  let toTransform

  try {
    toTransform = await findFile(/\.env/, workingDir)
  } catch (err) {
    return err
  }

  toTransform.forEach((el) => {
    const indexOfSlash = el.lastIndexOf('/')
    const lengthOfString = el.length
    const slicedString = el.slice(indexOfSlash + 1, lengthOfString)
    transformed.push(slicedString)
  })

  return transformed
}

function shellExecAsync(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, options, (code, stdout, stderr) => {
      if (code !== 0) return reject(new Error(stderr))
      return resolve(stdout)
    })
  })
}

module.exports = {
  readFile,
  writeFile,
  findFile,
  makeDir,
  findEnvFiles,
  shellExecAsync
}
