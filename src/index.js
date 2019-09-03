#!/usr/bin/env node

/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-expressions */

'use strict'

const fs = require('fs')
const program = require('commander')
const helper = require('./helper')
const envVars = require('./envVars')
const questions = require('./questions')
const create = require('./create')
const docker = require('./docker')

program
  .version('1.0.0')
  .description('Kubernetes deployment & service creator')

program
  .command('name <deployment>')
  .alias('n')
  .description('Name of your deployment.')
  .option('-d, --directory [directory] [optional]', 'Path to your project directory.'
  + 'By default it will use the current directory you are in.', process.cwd())
  .action(async (deployment, args) => {
    const workingDir = args.directory

    if (!fs.existsSync(workingDir)) {
      console.error('Not a directory:', workingDir)
      process.exit(1)
    }

    console.log(`Deployment name will be: ${deployment}\nWorking directory: ${workingDir}`)

    // changing directory
    process.chdir(args.directory)

    let processType
    let namespace
    let dockerRegistrySecretName
    let dockerImage
    let containerName
    let containerPort
    let hasEnv
    let env

    try {
      processType = await questions.processType()
      namespace = await questions.namespace()

      const buildDockerImage = await questions.buildDockerImage()

      if (!buildDockerImage.value) {
        const imageTag = await questions.provideTagForImage()
        const imageName = `${deployment}:${imageTag.value}`

        console.log(`Image (${imageName}) build started...`)

        // create docker image
        await helper.shellExecAsync(`docker build -t ${imageName} .`, { timeout: 999999 })

        const doPush = await questions.pushImage()

        if (doPush.value) {
          const url = await questions.getExternalRepoURL()

          const imageNameWithRepoURL = `${url.value}/${imageName}`

          // login
          await helper.shellExecAsync('docker login')
          // tag
          await helper.shellExecAsync(`docker tag ${imageName} ${imageNameWithRepoURL}`)
          // push
          await helper.shellExecAsync(`docker push ${imageNameWithRepoURL}`)

          dockerImage = await questions.dockerImage(imageNameWithRepoURL)
        } else {
          dockerImage = await questions.dockerImage(imageName)
        }
      } else {
        dockerImage = await questions.dockerImage()
      }

      const dockerSecret = await questions.dockerSecret()

      switch (dockerSecret.values) {
        case 'I dont have, but create it for me!':
          const secretName = await questions.dockerSecretName()
          const server = await questions.dockerServer()
          const username = await questions.dockerUsername()
          const password = await questions.dockerPassword()
          const email = await questions.dockerEmail()

          const dockerRegistry = await docker.registry(server.value, username.value, password.value, email.value)
          await create.dockerRegistrySecret(secretName.value, dockerRegistry)
          dockerRegistrySecretName = secretName.value

          break
        case 'I have one already in the cluster, will provide the name for it.':
          const existingSecretName = await questions.alreadyExistingDockerSecret()
          dockerRegistrySecretName = existingSecretName.value

          break
        default:
          break
      }
      containerName = await questions.containerName(deployment)
      containerPort = await questions.containerPort()
      hasEnv = await questions.hasEnv()
    } catch (err) {
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
        console.error('There is no .env file in the given folder.')
        process.exit(1)
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
        await create.deploymentWithEnvVars(
          deployment,
          namespace.value,
          processType.value,
          dockerImage.value,
          containerName.value,
          containerPort.value,
          env,
          dockerRegistrySecretName
        )
        console.log('Successfully created yaml for deployment with secrets/envvars.')
      } catch (err) {
        console.error('Error while creating deployment with secrets/envvars...', err)
        process.exit(1)
      }
    } else {
      try {
        await create.deployment(
          deployment,
          namespace.value,
          processType.value,
          dockerImage.value,
          containerName.value,
          containerPort.value,
          dockerRegistrySecretName
        )
        console.log('Successfully created yaml for deployment.')
      } catch (err) {
        console.error('Error while creating deployment...', err)
        process.exit(1)
      }
    }

    let shouldCreateService

    try {
      shouldCreateService = await questions.shouldCreateService()
    } catch (err) {
      throw new Error(err)
    }

    if (shouldCreateService.value) {
      try {
        const serviceType = await questions.internalOrExternalService()
        let typeOfService

        ((serviceType.value === 'internal') ? typeOfService = 'ClusterIP' : typeOfService = 'LoadBalancer')

        await create.service(deployment, namespace.value, processType.value, containerPort.value, typeOfService)
        console.log('Successfully created yaml file for Service!')
      } catch (err) {
        console.error('Error while creating Service yaml file.', err)
        process.exit(1)
      }
    }

    console.log('\n---- All done. ----\n')

    // TODO: make tests
    // TODO: provide dir multiple way: `-d ../project-dir`, `-d project-dir`
    // TODO: path parse
  })

program.parse(process.argv)
