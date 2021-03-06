# Kubernetes deployment & service generator CLI tool.

## Install

```sh
$ git clone git@github.com:kHRISl33t/create-deployment.git
$ cd create-deployment
$ npm i -g
$ create-deployment --help
$ create-deployment name --help
```

## Usage

- Go to your project directory and run `create-deployment name myProject`
- Or you can use `create-deploymentname myProject --directory /absolute/path/to/your/project/directory`
(sadly thats the only way right now)

`deployment-creator` will create a `kubernetes` folder inside your project.

## What's is this CLI tool for?

Using `create-deployment` you can setup quickly a simple deployment (with or without secret and envvars) and service yaml file for your application.

You will be prompt through the followings:

1. **Does your app have process type?** (default value: app)

    - *Expected value: String*

2. **In which namespace you want to run your application?** (default value: default)

    - *Expected value: String*

3. **Do you have a ready docker image?**

    - If the answer is **yes**, you will need to provide the url/name for the image. (e.g: `example.com/image:tag` or `image:tag`)

    - If the answer is **no**, it will build the image for you based on your Dockerfile in the project directory.  

        - **Do you want to push the created image to an external docker repository?*** 

            - If the answer is **yes**, it will ask for your docker repository's username and password. After successful login, you will need to give your repository's url **without an ending slash**. 

            - Few examples: 

                1. Dockerhub: **your_dockerhub_username**
                2. Azure: **repository-name.azurecr.io**
                3. AWS: **ACCOUNT_ID.dkr.ecr.LOCATION.amazonaws.com**
                4. Google: **gcr.io/YOUR_PROJECT_NAME**

3. **Provide your docker image name/url:** (default value: your_repository/your_image:version_tag)

    - *Expected value: String*

5. **Do you need/have a docker secret file?**

    - **Select your preferred option: (Use arrow keys)**

        - **I dont have, but create it for me!**

            - **Give a name for the docker-registry secret:** (default value: docker-registry)

                - *Expected value String*

            - **Provide your Private Docker Registry FQDN:** (default value: https://index.docker.io/v1/)

                - *Expected value String*

            - **Provide your Docker username:** (default value: username)

                - *Expected value String*

            - **Provide your Docker password:** (default value: password)

                - *Expected value String*

            - **Provide your Docker e-mail:** (default value: no@email.local)

                - *Expected value e-mail*

        - **I have one already in the cluster, will provide the name for it.**
            
            - **Give your already existing docker-secret name:** (default value: docker-registry)

                - *Expected value String*

        - **I don't need it.**

4. **Give a name to your docker container:** (default value: myimage)

    - *Expected value: String*

5. **On which port your docker container exposed?** (default value: 80)

    - *Expected value: Numbers between 0 and 65535*

6. **Do you have .env file(s)? (y/N)** (default value: no)

  - If the answer is **yes**:

    - **Select the env file you want to work with: (Use arrow keys)**

    - **Select the envvars you want to store as secret (if none hit ENTER): (Press `<space>` to select, `<a>` to toggle all, `<i>` to invert selection)**

    - **If none is selected all values from .env are going to be used in plain text format in your deployment!**

  - If the answer is **no**, no secret file will be created and env vars will be used in your deployment file.

7. **Will you need a service file for your deployment? (y/N)** (default value: no)

  - If the answer is **yes**

    - **External or Internal service? (Use arrow keys)**

      - You can choose **internal** or **external**.

  - If the answer is **no**, no service file is going to be created.

You will find a `kubernetes` folder in your project folder, where you will find all the created yaml files.

## How to apply the created files?

```sh
$ kubectl create -f kubernetes/docker-registry-secret.yml
$ kubectl create -f kubernetes/<DEPLOYMENT_NAME>-secrets.yml
$ kubectl create -f kubernetes/<DEPLOYMENT_NAME>-service.yml
$ kubectl create -f kubernetes/<DEPLOYMENT_NAME>-<PROCESS_TYPE>-deployment.yml
# get the IP for your deployment
$ kubectl -n NAMESPACE_NAME get service 
```

## If you are not familiar with Kubernetes

If you are not familiar with Kubernetes, I recommend reading my [Getting started with Kubernetes article](https://blog.risingstack.com/what-is-kubernetes-how-to-get-started/).

- Secrets:

A secret is an object in kubernetes, where people usually store sensitive informations like usernames and password. In the secret files the values are base64 encoded.

```yaml
# example secret usage in deployment
- name: DATABASE_PASSWORD
  valueFrom:
    secretKeyRef:
      key: databasepassword
      name: myapp-secrets
```

- Service:

A service is responsible for making our Pods discoverable inside the network or exposing them to the internet.

With an **Internal Service** your deployment gets a *ClusterIP* and it will be visible only inside the cluster.

With an **External Service** your deployment will get a *LoadBalancerIP (Public IP)* and it will be accessible from outside of the cluster.

## My plans for the future

- Support for `Persistent Disk` creation in GKE, AKS, EKS.
- Mount config files as `ConfigMap` or `secrets` if needed.










