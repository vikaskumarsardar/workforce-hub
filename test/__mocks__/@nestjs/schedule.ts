export function Interval(ms: number) {
  return () => {};
}

export function Timeout(ms: number) {
  return () => {};
}

export function Cron(cronExpression: string) {
  return () => {};
}

export class ScheduleModule {
  static forRoot() {
    return { module: class {} };
  }
}
