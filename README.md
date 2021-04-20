# Thanawat Super Omega

This is backend service of [Thanawat Super Omega](https://web.thanawat-super-omega.kaoths.dev/)  
Our project provides a tool that allows users who speak different language to be able to communicate with the others  

<sub>If you want to run this service locally see [getting start](#getting-start)</sub>  

## Services used  

#### Speech translation  
To translate speech from one language to another. we uses
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) converts source speech to text
- [Google Cloud Translation](https://cloud.google.com/translate) translates the text
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) converts translated text to desired language speech

#### Communication
We decided to use [WebSocket](https://en.wikipedia.org/wiki/WebSocket) as a communication protocol between our [frontend](https://web.thanawat-super-omega.kaoths.dev/) and this service.  
For implementation, we uses
- [Socket.IO](https://socket.io/) A library for event-base communication
- [NestJS Gateway](https://docs.nestjs.com/websockets/gateways) 

#### Deployment and CI/CD
- [Google Cloud Build](https://cloud.google.com/build) build and deploy container images
- [Google Container Registry](https://cloud.google.com/container-registry) store built container images
- [Google Cloud Run](https://cloud.google.com/run) serverless containerized application hosting

#### Domain registration
- [Google Domain](https://domains.google.com/) manage dns records
    - used with built-in CloudRun [Domain Mapping](https://cloud.google.com/run/docs/mapping-custom-domains)
    
## Team members  

| id         | firstname | lastname          |
|------------|-----------|-------------------|
| 6031014621 | Nathaphum | Niyomsathien      |
| 6031020321 | Thanawat  | Jierawatanakanok  |
| 6031021021 | Tanawit   | Kritwongwiman     |
| 6031032921 | Nithipud  | Tunticharoenviwat |

## Getting start

#### Prerequisites
- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/getting-started/install) (recommended)

#### Installation

```bash
# install dependencies
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# development in watch mode
$ yarn start:dev
# or just
$ yarn dev

# production mode
$ yarn start:prod
```
