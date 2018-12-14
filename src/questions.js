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
  buildDockerImage: async () => await inquirer.prompt([{
    type: 'confirm',
    name: 'value',
    message: 'Do you have a ready docker image?'
    + '\n- If yes, provide the url/name for it. (e.g: `example.com/image:tag` or `image:tag`)'
    + '\n- If no, it will build the image for you with your given project '
    + 'name and you will be asked for version tag.',
    default: true,
  }]),
  provideTagForImage: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Provide version tag for your docker image:',
    default: 'latest',
    validate: value => validate(value, Joi.string().alphanum().required())
  }]),
  pushImage: async () => await inquirer.prompt([{
    type: 'confirm',
    name: 'value',
    message: 'Do you want to push the created image to an external docker repository?'
    + '\n- If yes, you will need to provide your docker repository\'s username, password and URL',
    default: false,
  }]),
  getExternalRepoURL: async () => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Give your external docker repository url: (e.g: your_dockerhub_repository, WITHOUT ending slash)',
    // add check here to validate there is no ending slash
    validate: value => validate(value, Joi.string().required())
  }]),
  dockerImage: async image => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Provide your docker image name/url:',
    default: (image === undefined) ? 'dockerhub.io/myimage:tag' : `${image}`,
    validate: value => validate(value, Joi.string().required())
  }]),
  containerName: async name => await inquirer.prompt([{
    type: 'input',
    name: 'value',
    message: 'Give a name to your docker container:',
    default: `${name}`,
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
