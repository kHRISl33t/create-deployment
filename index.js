#!/usr/bin/env node

const fs = require('fs')
const helper = require('./helper')
const envVars = require('./envVars')
const questions = require('./questions')
const create = require('./create')

const program = require('commander');

program
  .version('1.0.0')
  .description('Kubernetes deployment & service creator');

program
  .command('name <deployment>')
  .alias('n')
  .description('Name of your deployment.')
  .option('-d, --directory [directory] [optional]', 'Path to your project directory. By default it will use the current directory you are in.', process.cwd())
  .action(async (deployment, args) => {
    const workingDir = args.directory

    if (!fs.existsSync(workingDir)) {
      console.error('Not a directory:', workingDir)
      process.exit(1)
    }

    console.log(
    `Deployment name will be: ${deployment}\nWorking directory: ${workingDir}`
    )

    // changing directory
    process.chdir(args.directory)

    let processType
    let namespace
    let dockerImage
    let containerName
    let containerPort
    let hasEnv
    let env

    try {
      processType = await questions.processType()
      namespace = await questions.namespace()
      dockerImage = await questions.dockerImage()
      containerName = await questions.containerName()
      containerPort = await questions.containerPort()
      hasEnv = await questions.hasEnv()
    } catch (err) {
      console.error('Error:', err)
      throw new Error(err)
    }

    if (hasEnv.value) {
      let foundFiles
      let listOfFoundEnvFiles

      try {
        // search for .env file in the given directory
        foundFiles = await helper.findEnvFiles(workingDir)
        // select the needed env file to work with
        listOfFoundEnvFiles = await questions.listOfFoundEnvFiles(foundFiles)
      } catch (err) {
        console.error(err)
      }
  
      try {
        const file = listOfFoundEnvFiles.values
        const path = `${workingDir}/${file}`

        const envFile = await envVars.processEnvFile(path)
        env = await envVars.createEnvVars(envFile, deployment)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }

      try { 
        await create.deploymentWithEnvVars(deployment, namespace.value, processType.value, dockerImage.value, containerName.value, containerPort.value, env)
        console.log('Successfully created yaml for deployment with secrets/envvars.')
      } catch (err) {
        console.error('Error while creating deployment with secrets/envvars...', err)
      }
    } else {
      try {
        await create.deployment(deployment, namespace.value, processType.value, dockerImage.value, containerName.value, containerPort.value)
        console.log('Successfully created yaml for deployment.')
      } catch (err) {
        console.error('Error while creating deployment...', err)
      }
    }

    let shouldCreateService

    try {
      shouldCreateService = await questions.shouldCreateService()
    } catch (err) {
      console.error('Error:', err)
    }

    if (shouldCreateService.value) {
      try {
        const serviceType = await questions.internalOrExternalService()
        let typeOfService

        ((serviceType.value === 'internal') ? typeOfService = 'ClusterIP' : typeOfService = 'LoadBalancer')

        await create.service(deployment, processType.value, containerPort.value, typeOfService)
        console.log('Successfully created yaml file for Service!')
      } catch (err) {
        console.error('Error while creating Service yaml file.', err)
      }
    }

    // TODO: init eslint
    // TODO: √ add input validation
    // TODO: use mustache
    // TODO: make tests
    // TODO: provide dir multiple way: `-d ../project-dir`, `-d project-dir`
    // depends on the current folder

  })

program.parse(process.argv)
