import * as autobahn from "autobahn";

export class WampQueue {

  private queue: any[] = [];

  call<T>(cmd: string, ...args: any[]) {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({type: 'call', cmd, args: args, resolve, reject});
    });
  }

  publish(topic: string, ...args: any[]) {
    return new Promise<any>((resolve, reject) => {
      this.queue.push({type: 'publish', topic, args: args, resolve, reject});
    });
  }

  send(session: autobahn.Session) {
    let q: any;

    while (q = this.queue.shift()) {
      this.dispatch(q, session);
    }
  }

  private dispatch(q: any, session: autobahn.Session) {
    switch (q.type) {
      case 'call':
        session.call<any>(q.cmd, ...q.args)
          .then(response => q.resolve(response))
          .catch(error => q.reject(error));
        break;
      case 'publish':
        session.publish(q.topic, ...q.args)
          .then(response => q.resolve(response))
          .catch(error => q.reject(error));
        break;
    }
  }
}