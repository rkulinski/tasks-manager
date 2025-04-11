## Description

Tasks management

Requirements:
// TODO

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Sample data
- Create task
```
{
  "title": "Finish project report",
  "description": "Complete the final section and send it to the manager",
  "startTime": "2025-04-11T10:00:00.000Z",
  "endTime": "2025-04-11T11:00:00.000Z",
  "userId": "7b9c838e-2f44-4b65-9c18-bf3f1de88b87"
}
```
- Update task
```
{
  "status": "completed"
}

```