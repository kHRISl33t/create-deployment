'use strict'

async function registry(server, username, password, email) {
  const auth = Buffer.from(`${username}:${password}`).toString('base64')
  const json = {
    auths: {
      [server]: {
        username,
        password,
        email,
        auth
      }
    }
  }

  return Buffer.from(JSON.stringify(json)).toString('base64')
}

module.exports = {
  registry,
}
