const helper = require('./helper')
const _ = require('lodash')
const questions = require('./questions')
const create = require('./create')

async function processEnvFile(pathToFile) {
  let envVars = {}
  let data = ''

  try {
    data = await helper.readFile(pathToFile)
  } catch (err) {
    console.error(`Error while reading file from ${pathToFile}`)
    throw new Error(`Error in processEnvVars function: ${err}`)
  }

  if (data.length) {
    const transform = data

    // split values after each line
    transform.split('\n').forEach(line => {
      // get index of '='
      let equalSignIndex = line.indexOf('=')
      // get length of string
      let lengthOfString = line.length
  
      // returns -1 if there is no match for the given char
      if (equalSignIndex !== -1) {
        // create key value pairs of env vars
        let firstPart = line.slice(0, equalSignIndex)
        let secondPart = line.slice(equalSignIndex + 1, lengthOfString)
        envVars[firstPart] = secondPart
      }
    })

    return envVars
  } else {
    throw new Error('Empty .env files are not allowed')
  }
} 

async function createEnvVars(object, name) {
  let nameOfEnvVars = []
  let secretKeyValues = ''
  let ListOfEnvVars = []
  let notSelectedToStoreAsSecret = ''
  let secretValues = ''

  // get keys of envvars and push it to array
  _.forOwn(object, (value, key) => {
    nameOfEnvVars.push(key)
  })

  try {
    ListOfEnvVars = await questions.listOfEnvVars(nameOfEnvVars)
  } catch (err) {
    console.error('Error cant get selected envvars from choices.')
    throw new Error('Error cant get selected envvars from choices:', err)
  }

  const { values } = ListOfEnvVars

  /**
   * create a new array with values
   * were not selected to store as
   * secret
   */
  const notSelected = _.differenceBy(nameOfEnvVars, values)

  // create envs for non secret key values
  notSelected.forEach((item, i) => {
    if (values.length === 0) {
      if (i === notSelected.length - 1) {
        notSelectedToStoreAsSecret += `        - name: ${item}
          value: "${object[item]}"`
      } else {
        notSelectedToStoreAsSecret += `        - name: ${item}
          value: "${object[item]}"\n`
      }
    } else {
      notSelectedToStoreAsSecret += `        - name: ${item}
          value: "${object[item]}"\n`
    }
  })

  // create env for secret key values
  values.forEach((item, i) => {
    // convert key to lowercase and remove special characters from it
    let formatKey = `${item.toLowerCase().replace(/[^a-zA-Z ]/g, "")}`
    // create base64 values
    let base64Value = `${Buffer.from(object[item]).toString('base64')}`
    secretKeyValues += `  ${formatKey}: ${base64Value}\n`

    // create env part for deployment
    if (i === values.length - 1) {
      secretValues += `        - name: ${item}\n          valueFrom:\n            secretKeyRef:\n              key: ${formatKey}\n              name: ${name}`
    } else {
      secretValues += `        - name: ${item}\n          valueFrom:\n            secretKeyRef:\n              key: ${formatKey}\n              name: ${name}\n`
    }
  })

  try {
    if (secretKeyValues !== '') {
      await create.secretFile(secretKeyValues, name)
    }
    return await create.envSection(notSelectedToStoreAsSecret, secretValues)
  } catch (err) {
    console.error('Couldnt create env for deployment.', err)
    throw new Error(err)
  }
}

module.exports = {
  processEnvFile,
  createEnvVars,
}
