const helper = require('./helper')
const fs = require('fs')

async function secretFile(values, name) {
  let secretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${name}
type: Opaque
data:
${values}`

  try {
    if (!fs.existsSync('kubernetes')) {
      await helper.makeDir('kubernetes')
    }
    await helper.writeFile(`kubernetes/${name}-secrets.yml`, secretYaml)
    console.log('Successfully created yaml file for secrets.')
  } catch (err) {
    console.error('Error while creating Secrets yaml file')
    throw new Error(err)
  }
}

async function envSection(envVars, secretsEnvVars) {
  return `- env:\n${envVars}${secretsEnvVars}`
}

async function deploymentWithEnvVars(deployment, namespace, processType, image, containerName, containerPort, env) {
  let deploymentYaml = `
apiVersion: extensions/v1beta1
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
    `

  try {
    if (!fs.existsSync('kubernetes')) {
      await helper.makeDir('kubernetes')
    }
    await helper.writeFile(`kubernetes/${deployment}-${processType}-deployment.yml`, deploymentYaml)
    console.log('Successfully created Deployment yaml file.')
  } catch (err) {
    console.error('Error while creating deployment yaml file')
    throw new Error(err)
  }
}

async function deployment(deployment, namespace, processType, image, containerName, containerPort) {
  let deploymentYaml = `
apiVersion: extensions/v1beta1
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
    `

  try {
    if (!fs.existsSync('kubernetes')) {
      await helper.makeDir('kubernetes')
    }
    await helper.writeFile(`kubernetes/${deployment}-${processType}-deployment.yml`, deploymentYaml)
    console.log('Successfully created Deployment yaml file.')
  } catch (err) {
    console.error('Error while creating Deployment yaml file')
    throw new Error(err)
  }
}

async function service(deployment, processType, containerPort, typeOfService) {
  let serviceYaml = `
apiVersion: v1
kind: Service
metadata:
  name: ${deployment}-service
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

  try {
    await helper.writeFile(`kubernetes/${deployment}-service.yml`, serviceYaml)
    console.log('Successfully created Service yaml file.')
  } catch (err) {
    console.error('Error while creating Service yaml file')
    throw new Error(err)
  }
}

module.exports = {
  secretFile,
  envSection,
  deployment,
  deploymentWithEnvVars,
  service,
}
