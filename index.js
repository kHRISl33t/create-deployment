#!/usr/bin/env node

const fs = require('fs')
const { findEnvFiles } = require('./findEnvFiles')
const envVars = require('./envVars')
const questions = require('./questions')
const create = require('./create')

const program = require('commander');

program
  .version('1.0.0')
  .description('Kubernetes deployment creator for Node.js');

program
  .command('name <deployment>')
  .alias('n')
  .description('Name of your deployment.')
  .option('-d, --directory [directory]', 'Path to your project directory.', process.cwd())
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
        foundFiles = await findEnvFiles(workingDir)
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

      // handle error here on the top not inside
      await create.deploymentWithEnvVars(deployment, namespace.value, processType.value, dockerImage.value, containerName.value, containerPort.value, env)
    } else {
      await create.deployment(deployment, namespace.value, processType.value, dockerImage.value, containerName.value, containerPort.value, env)
    }

    const shouldCreateService = await questions.shouldCreateService()

    if (shouldCreateService.value) {
      try {
        const serviceType = await questions.internalOrExternalService()
        let typeOfService

        ((serviceType.value === 'internal') ? typeOfService = 'ClusterIP' : typeOfService = 'LoadBalancer')

        await create.service(deployment, processType.value, containerPort.value, typeOfService)
      } catch (err) {
        console.error('Error while creating Service yaml file.')
        throw new Error(err)
      }
    }

  })

program.parse(process.argv)