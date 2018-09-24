const inquirer = require('inquirer')
const Joi = require('joi')

async function validate(toValidate, type) {
  let valid
  await Joi.validate(toValidate, type)
    .then(res => valid = true)
    .catch(err => valid = err)
  return valid
}

module.exports = {
  processType: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'Does your app have process type?',
      default: 'app',
      validate: (value) => validate(value, Joi.string().alphanum())
    }])
  },
  namespace: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'In which namespace you want to run your application?',
      default: 'default',
      validate: (value) => validate(value, Joi.string().alphanum().required())
    }])
  },
  dockerImage: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'Provide your docker image name/url:',
      default: 'dockerhub.io/myimage:tag',
      validate: (value) => validate(value, Joi.string().required())
    }])
  },
  containerName: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'Give a name to your docker container:',
      default: 'myimage',
      validate: (value) => validate(value, Joi.string().alphanum().required())
    }])
  },
  containerPort: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'On which port your container exposed?',
      default: '80',
      validate: (value) => validate(value, Joi.number().integer().min(0).max(65535).required())
    }])
  },
  hasEnv: async() => {
    return await inquirer.prompt([{
      type: 'confirm',
      name: 'value',
      message: 'Do you have .env file(s)?',
      default: false,
      validate: (value) => validate(value, Joi.boolean().required())
    }])
  },
  listOfFoundEnvFiles: async(files) => {
    return await inquirer.prompt([{
      type: 'list',
      name: 'values',
      message: 'Select the env file you want to work with:',
      choices: files,
      default: ['']
    }])
  },
  listOfEnvVars: async(nameOfEnvVars) => {
    return await inquirer.prompt([{
      type: 'checkbox',
      name: 'values',
      message: 'Select the envvars you want to store as secret (if none hit ENTER):',
      choices: nameOfEnvVars,
      default: ['']
    }])
  },
  shouldCreateService: async() => {
    return await inquirer.prompt([{
      type: 'confirm',
      name: 'value',
      message: 'Will you need a service file for your deployment?',
      default: false,
      validate: (value) => validate(value, Joi.boolean().required())
    }])
  },
  internalOrExternalService: async() => {
    return await inquirer.prompt([{
      type: 'list',
      name: 'value',
      message: 'External or Internal service?',
      choices: ['internal', 'external'],
      default: ['internal']
    }])
  }
}

