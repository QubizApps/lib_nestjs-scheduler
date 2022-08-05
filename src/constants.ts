export const SCHEDULED_TASK_HANDLER_METADATA = 'SCHEDULED_TASK_HANDLER_METADATA';

export const INTERVAL_REGEX =
  /(@(yearly|monthly|weekly|daily|hourly))|(@every (\d+(ns|us|µs|ms|s|m|h)))|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;
