pipeline {

    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKERHUB_CRED = 'dockerhub_cred' //  Credential ID in Jenkins
        DOCKERHUB_REPO = 'r3dacted42'
        GITHUB_REPO_URL = 'https://github.com/r3dacted42/sparrow-vps.git'

        REPO_IMAGE = 'sparrow-repo-service'
        CONT_IMAGE = 'sparrow-container-service'
        FRON_IMAGE = 'sparrow-frontend'
    }

    stages {

        stage('Git Checkout') {
            steps {
                script {
                    git branch: 'main', url: "${GITHUB_REPO_URL}"
                }
            }
        }

        stage('Build and Push Repo Service') {
            steps {
                script {
                    docker.withRegistry('', "${DOCKERHUB_CRED}") {
                        buildAndPushImage("${DOCKERHUB_REPO}/${REPO_IMAGE}:latest", './repo-service')
                    }
                }
            }
        }

        stage('Build and Push Container Service') {
            steps {
                script {
                    docker.withRegistry('', "${DOCKERHUB_CRED}") {
                        buildAndPushImage("${DOCKERHUB_REPO}/${CONT_IMAGE}:latest", './container-service')
                    }
                }
            }
        }

        stage('Build and Push Frontend') {
            steps {
                script {
                    docker.withRegistry('', "${DOCKERHUB_CRED}") {
                        buildAndPushImage("${DOCKERHUB_REPO}/${FRON_IMAGE}:latest", './frontend')
                    }
                }
            }
        }

        stage('Run Ansible Playbook') {
            steps {
                script {
                    ansiblePlaybook(
                        playbook: 'playbook.yml'
                    )
                }
            }
        }
    }
}

def buildAndPushImage(String fullImageName, String context) {
    echo "Building image: ${fullImageName} from context: ${context}"
    def builtImage = docker.build(fullImageName, "--build-arg BUILDKIT_INLINE_CACHE=1 -f ${context}/Dockerfile ${context}")
    builtImage.push()
    echo "Pushed image: ${fullImageName}"
}
