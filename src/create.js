/* eslint-disable no-shadow */
/* eslint-disable no-return-await */

'use strict'

const fs = require('fs')
const helper = require('./helper')

async function dockerRegistrySecret(name, value) {
  console.log(value)
  const dockerSecretYaml = `apiVersion: v1
data:
  .dockerconfigjson: ${value}
kind: Secret
metadata:
  name: ${name}
type: kubernetes.io/dockerconfigjson
`

  if (!fs.existsSync('kubernetes')) {
    await helper.makeDir('kubernetes')
  }

  return await helper.writeFile('kubernetes/docker-registry-secret.yml', dockerSecretYaml)
}

async function secretFile(values, name) {
  const secretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${name}
type: Opaque
data:
${values}`

  if (!fs.existsSync('kubernetes')) {
    await helper.makeDir('kubernetes')
  }

  return await helper.writeFile(`kubernetes/${name}-secrets.yml`, secretYaml)
}

async function envSection(envVars, secretsEnvVars) {
  // replace this with arrow function and instan return the value
  return `- env:\n${envVars}${secretsEnvVars}`
}

async function deploymentWithEnvVars(
  deployment,
  namespace,
  processType,
  image,
  containerName,
  containerPort,
  env,
  dockerRegistrySecretName
) {
  let imagePullSecrets = `imagePullSecrets:
      - name: ${dockerRegistrySecretName}`

  if (dockerRegistrySecretName === undefined) imagePullSecrets = ''

  const deploymentYaml = `apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  labels:
    app: ${deployment}
  name: ${deployment}-${processType}
  namespace: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${deployment}
      tier: ${processType}
  template:
    metadata:
      labels:
        app: ${deployment}
        tier: ${processType}
    spec:
      containers:
      ${env}
        image: ${image}
        imagePullPolicy: IfNotPresent
        name: ${containerName}
        resources: {}
        ports:
        - containerPort: ${containerPort}
          protocol: TCP
      ${imagePullSecrets}`

  if (!fs.existsSync('kubernetes')) {
    await helper.makeDir('kubernetes')
  }

  return await helper.writeFile(`kubernetes/${deployment}-${processType}-deployment.yml`, deploymentYaml)
}

async function deployment(deployment, namespace, processType, image, containerName, containerPort, dockerRegistrySecretName) {
  let imagePullSecrets = `imagePullSecrets:
      - name: ${dockerRegistrySecretName}`

  if (dockerRegistrySecretName === undefined) imagePullSecrets = ''

  const deploymentYaml = `apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  labels:
    app: ${deployment}
  name: ${deployment}-${processType}
  namespace: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${deployment}
      tier: ${processType}
  template:
    metadata:
      labels:
        app: ${deployment}
        tier: ${processType}
    spec:
      containers:
      - image: ${image}
        imagePullPolicy: IfNotPresent
        name: ${containerName}
        resources: {}
        ports:
        - containerPort: ${containerPort}
          protocol: TCP
      ${imagePullSecrets}`

  if (!fs.existsSync('kubernetes')) {
    await helper.makeDir('kubernetes')
  }

  return await helper.writeFile(`kubernetes/${deployment}-${processType}-deployment.yml`, deploymentYaml)
}

async function service(deployment, namespace, processType, containerPort, typeOfService) {
  const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: ${deployment}-service
  namespace: ${namespace}
  labels:
    app: ${deployment}
spec:
  selector:
    app: ${deployment}
    tier: ${processType}
  ports:
  - port: 80
    targetPort: ${containerPort}
  type:
    ${typeOfService}
  `

  return await helper.writeFile(`kubernetes/${deployment}-service.yml`, serviceYaml)
}

module.exports = {
  secretFile,
  envSection,
  deployment,
  deploymentWithEnvVars,
  service,
  dockerRegistrySecret
}
