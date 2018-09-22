const inquirer = require('inquirer')

module.exports = {
  processType: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'Does your app have process type?',
      default: 'app'
    }])
  },
  namespace: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'In which namespace you want to run your application?',
      default: 'default'
    }])
  },
  dockerImage: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'Provide your docker image name/url:',
      default: 'dockerhub.io/myimage:tag'
    }])
  },
  containerName: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'Give a name to your docker container:',
      default: 'myimage'
    }])
  },
  containerPort: async() => {
    return await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: 'On which port your container exposed?',
      default: '80'
    }])
  },
  hasEnv: async() => {
    return await inquirer.prompt([{
      type: 'confirm',
      name: 'value',
      message: 'Do you have .env file(s)?',
      default: false
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
      message: 'You will need a service file for your deployment?',
      default: false
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

