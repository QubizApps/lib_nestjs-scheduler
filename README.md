# @qubizapps/nestjs-scheduler

Dynamic management of scheduled tasks for NestJS. Default implementation is a wrapper around @nestjs/schedule package with and easy to use API interface and internally following a DDD/CQRS approach.

## Requirements

This package assumes it will be installed in a NestJS project. Therefore, core nestjs packages are assumed to be already installed and are declared as peer dependencies. `@qubizapps/nestjs-commons` is also required.

Required dependencies(should already be there for a NestJS project) + qubizapps packages

```bash
$> npm install --save \
    @nestjs/common \
    @nestjs/core \
    @nestjs/cqrs \
    @nestjs/schedule \
    @nestjs/swagger \
    @qubizapps/nestjs-commons
```

The only storage option available for now is `postgres`(see module options below on how to configure). That would require the following packages to be installed additionally:

```bash
$> npm install --save pg typeorm @nestjs/typeorm
```

There is also expected that a typeorm connection is already configured per project(via `TypeOrmModule.forRoot({...})` or `TypeOrmModule.forRootAsync({...})`).

## Installation

```bash
$> npm install --save @qubizapps/nestjs-scheduler
```

## Configuration

Register the `SchedulerModule` in your main NestJS module. You can add it to the top module, as the scheduler module will register itself as a global dynamic module. There will be also a `forRootAsync()` variant in the near future for a more flexible configuration approach.

```typescript
import { SchedulerModule } from '@qubizapps/nestjs-scheduler';

@Module({
  imports: [SchedulerModule.forRoot({...})],
})
class AppModule {}
```

### Module Options

The module should work out of the box without configuring anything. All options have sane defaults that will be enough most of the time. Among the most frequent options you'll want to change are the following

#### Storage options

The below values are the defaults used if not specified. Change them according to your project needs. All fields are optional so you need to specified only what you want to change

```typescript
SchedulerModule.forRoot({
  //...
  storage: {
    type: 'postgres', // only postgres support, mongo will be available
    // postgres options, if storage type is postgres
    postgres: {
      connection: 'default', // typeorm datasource name as configured in the project
      schema: 'public', // schema where internally managed tables will be created
      migrationTable: 'scheduler_migrations', // where to store internal migration state data
    },
  },
});
```

Just to briefly mention it, the package is handling the internal storage needs automatically. All required tables will be created in the configured schema. Future table schema changes are handled via typeorm migrations that are running automatically when the module is loaded.

#### API Options

The package automatically registers a controller providing the default API endpoints to be used for managing scheduled tasks. It also sets up swagger decorators on the API input/outputs. This will become automatically available to you by enabling swagger docs on the project level.

```typescript
SchedulerModule.forRoot({
  //...
  api: {
    enable: true, // default value, disable if you want to skip registering the endpoints
    prefix: '', // default empty string, specify a prefix to use on all API endpoints
  },
});
```

#### Scheduler Options

Each scheduled task needs to define a `type` name, that will be used to match the task with its handler. This needs to be a string, there are no special validation on it by default. In order to enforce only certain task types, you can specify them in the configuration

```typescript
SchedulerModule.forRoot({
  scheduler: {
    types: ['SOME_TYPE', 'SOME_OTHER_TYPE'],
  },
});
```

Doing so will automatically apply an enum validation on the create/update task endpoints. There is also a get available task types endpoint to list those via the API, in case FE needs to populate a dropdown list.

## Usage

Before creating tasks via the API, you need to define task handlers in code. These can be any class that implements the `IScheduledTaskHandler<T>` interface and are registered as providers in your own nestjs modules.
They also need to be decorated with the `ScheduledTaskHandler` decorator.

```typescript
import {
  IScheduledTaskHandler,
  ScheduledTaskHandle,
  ScheduledTaskHandler,
} from '@qubizapps/nestjs-scheduler';

export type PingTaskHandlerOutput = {
  taskName: string;
  params: { [name: string]: any };
  timestamp: number;
};

@ScheduledTaskHandler('ping')
export class PingTaskHandler implements IScheduledTaskHandler<PingTaskHandlerOutput> {
  constructor(private readonly logger: Logger) {}

  async run(task: ScheduledTaskHandle): Promise<PingTaskHandlerOutput> {
    return {
      taskName: task.name,
      params: task.params,
      timestamp: new Date().getTime(),
    };
  }
}
```

Implementation is expected to return a value corresponding to the output of the task. This output will be stored in the database and will be available via the API output. You can see what was the last outcome of the running task.

The same goes with error handling. If task is failing for some reason(not handled by user space code), then error will be stored in the task's state and will be available via the API output. This way you can keep track of what is happening in the background.

## Creating a task

To run the above code, a scheduled task needs to be defined, linking the task type to the value defined in the task handler decorator.
You can use the swagger UI to test the API.

Request payload

```json
{
  "name": "Ping Task",
  "type": "ping",
  "interval": "* * * * *",
  "params": { "test": "test" },
  "tags": { "type": "ping", "group": "something" },
  "autostart": true
}
```

Response payload

```json
{
  "data": {
    "id": "67ec6115-10bb-48bf-b880-3cc47fc21aa4",
    "name": "Ping Task",
    "type": "ping",
    "taskType": "cronjob",
    "interval": "* * * * *",
    "params": {
      "test": "test"
    },
    "tags": {
      "type": "ping",
      "group": "something"
    },
    "status": "started",
    "createdAt": "2022-08-20T15:58:59.537Z"
  }
}
```

Short explanation of task options/fields

- `name` - name of the task, human readable. Should be unique.
- `type` - type of the task, this is the value defined in the task handler decorator. One type of task can be run multiple times with different parameters.
- `interval` - most important option of the task, it defined how often or when it will be triggered. Depending on the definition 2 types of tasks can be created
  - `cronjob` - a task that runs at a particular time
  - `interval` - a task that runs at every interval of time
- `params` - parameters that will be passed to the task handler.
- `tags` - tags that can be used to filter tasks. This can come in handy when you want to split the task management into different filtering groups(e.g running tasks grouped by tenant id, etc.)
- `autostart` - whether the task should be put immediately in the `started` status. This will actually register the task as an interval or cronjob.
- `status` - a task can be created in the `stopped` state, task will exist in the DB but will not be registered for running yet. `started` is the oposite state. When task is started it will be reloaded every time the module/application is restarted.

## Interval specs

Interval needs to be a string following cronjob specs. It also support some special values like `@hourly`, `@daily`, `@monthly`, `@yearly` as shortcuts. All this will create a `cronjob` type of task.

To create an `interval` task, interval option has the following format
`@each <interval><unit>` where interval is the time amount and unit is one the short notation of time units like `ns`, `ms`, `s`, `m` and so on.

Examples

- `@each 10s`
- `0 0 * * *` - every day at midnight

## Task operations

We advise you to check the API swagger UI to get familiar with the options available. The most important to mention are the ability to start/stop tasks(basically pausing/restarting their execution), force running tasks manually on the spot(ignoring scheduled interval or task status), listing tasks with advanced filtering capabilities etc.

## Advanced usage

// TBW
