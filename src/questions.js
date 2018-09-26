/* eslint-disable no-return-await */
/* eslint-disable newline-per-chained-call */

'use strict'

const inquirer = require('inquirer')
const Joi = require('joi')

async function validate(toValidate, type) {
  let valid
  await Joi.validate(toValidate, type)
    .then(() => {
      valid = true
    })
    .catch((err) => {
      valid = err
    })
  return valid
}

module.exports = {
  processType: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Does your app have process type?',
    default: 'app',
    validate: value => validate(value, Joi.string().alphanum())
  }]),
  namespace: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'In which namespace you want to run your application?',
    default: 'default',
    validate: value => validate(value, Joi.string().alphanum().required())
  }]),
  dockerImage: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Provide your docker image name/url:',
    default: 'dockerhub.io/myimage:tag',
    validate: value => validate(value, Joi.string().required())
  }]),
  containerName: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Give a name to your docker container:',
    default: 'myimage',
    validate: value => validate(value, Joi.string().alphanum().required())
  }]),
  containerPort: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'On which port your container exposed?',
    default: '80',
    validate: value => validate(value, Joi.number().integer().min(0).max(65535).required())
  }]),
  hasEnv: async () => await inquirer.prompt([{
    type: 'confirm',
    name: 'value',
    message: 'Do you have .env file(s)?',
    default: false,
    validate: value => validate(value, Joi.boolean().required())
  }]),
  listOfFoundEnvFiles: async files => await inquirer.prompt([{
    type: 'list',
    name: 'values',
    message: 'Select the env file you want to work with:',
    choices: files,
    default: ['']
  }]),
  listOfEnvVars: async nameOfEnvVars => await inquirer.prompt([{
    type: 'checkbox',
    name: 'values',
    message: 'Select the envvars you want to store as secret (if none hit ENTER):',
    choices: nameOfEnvVars,
    default: ['']
  }]),
  shouldCreateService: async () => await inquirer.prompt([{
    type: 'confirm',
    name: 'value',
    message: 'Will you need a service file for your deployment?',
    default: false,
    validate: value => validate(value, Joi.boolean().required())
  }]),
  internalOrExternalService: async () => await inquirer.prompt([{
    type: 'list',
    name: 'value',
    message: 'External or Internal service?',
    choices: ['internal', 'external'],
    default: ['internal']
  }])
}
