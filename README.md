# Tasks management

## API Functionality

The API must provide the following functionalities:

- **Task Creation**: Allow users to create new tasks.
- **Mark Task as Completed**: Enable users to mark tasks as completed.
- **Retrieve All Tasks**: Allow fetching a list of all tasks with the option to filter by status (completed/open).
- **Retrieve User's Tasks**: Permit fetching a specific user's tasks with the option to filter by status (completed/open).

## Constraints

- **Rate Limiting for Task Creation**: A user can create a maximum of 5 tasks per minute.
- **Time Conflict Prevention**: Prevent overlapping time slots for tasks belonging to the same user.
- **Global Task Creation Limit (Optional)**: No more than 20 tasks can be created globally by all users within a 5-minute window.

## Technical Requirements

- **Framework**: NestJS
- **Language**: TypeScript
- **Input Data Validation**: `class-validator` for input validation.
- **Data Storage**: in-memory storage (e.g., `Map<string, Task[]>`).
- **API Hosting via Container**: Docker with health check capabilities.

## Project setup
The application runs on [http://localhost:3000](http://localhost:3000) by default.

You can start the app using either local setup or Docker:

### Local (without docker)

```bash
$ npm install
```

#### Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### With Docker

```bash
# runs api in docker in development mode
$ docker compose up
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

## Continuous Integration

This project utilizes GitHub Actions for Continuous Integration (CI) to ensure code quality and automate testing and deployment processes.

- **Automated Testing**: Whenever a pull request is created or code is pushed to the main branch, the CI pipeline automatically runs the test suite.
- **Linting and Formatting Checks**: The CI process includes running `eslint` and `prettier` to maintain code consistency.

### Configuration

The CI pipeline is configured in the `.github/workflows` directory. Make sure to check and update these workflow files to suit your project needs.

## Linters and Formatters

This project utilizes `eslint` for JavaScript linting and `prettier` for code formatting, ensuring consistent and high-quality code.

- To fix linting errors automatically, use the `lint:fix` command provided in the `package.json` file:

  ```bash
  npm run lint
  ```

- To format the code, use the `format` command:

  ```bash
  npm run format
  ```