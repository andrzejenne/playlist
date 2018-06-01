import {Injectable} from '@angular/core';
import autobahn, {ICallOptions, IPublication, IPublishOptions, IRegistration, ISubscription} from "autobahn";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable, Subscription} from "rxjs";
import {skipWhile} from "rxjs/operators";
import {WampQueue} from "./wamp/Queue";
import {ServerManagerService} from "./ServerManagerService";
import {Server} from "../models/server";
import {Subject} from "rxjs/Subject";

export interface SessionSubScriptionFunction {
  (session: autobahn.Session): void;
}

@Injectable()
export class WampService {

  // @todo - not ready for multiserver support
  private session: autobahn.Session;

  private subj: BehaviorSubject<autobahn.Session>;

  private obs: Observable<autobahn.Session> = null;

  private queue = new WampQueue();

  private registrations: { [index: number]: { coms: IRegistration[], subs: ISubscription[] } } = {}; // @todo - proper interface

  private _ri = 1;

  public onClose = new Subject<{ server: Server, reason }>();
  public onOpen = new Subject<Server>();

  public serverSwitched = new Subject();
  public connected = new Subject<string>();
  public disconnected = new Subject<string>();

  constructor(private serversManager: ServerManagerService) {

    this.subj = new BehaviorSubject<autobahn.Session>(null);

    this.obs = this.subj.asObservable().pipe(skipWhile(ses => !ses));

    // this.loadServers();

    Observable.fromEvent(window, 'beforeunload').subscribe(event => this.unregisterAll());
  }

  get subscribe(): (callback: SessionSubScriptionFunction) => Subscription {
    return this.obs.subscribe.bind(this.obs);
  }

  get publish(): (topic: string, args?: any[], kwargs?: any, options?: IPublishOptions) => When.Promise<IPublication> {
    if (this.session) {
      return this.session.publish.bind(this.session);
    }
    else {
      return this.queue.publish.bind(this.queue);
      // throw WampService.MSG_WAMP_NOT_AVAIL
    }
  }

  get call(): <TResult>(procedure: string, args?: any[], kwargs?: any, options?: ICallOptions) => When.Promise<TResult> {
    if (this.session) {
      return this.session.call.bind(this.session);
    }
    else {
      return this.queue.call.bind(this.queue);
      // throw WampService.MSG_WAMP_NOT_AVAIL;
    }
  }

  public register(commandsAndSubscriptions: { coms?: { [index: string]: any }, subs?: { [index: string]: any } }) { // @todo - proper interface
    let ri = (this._ri);

    console.info('WampService@register', ri);

    this.registrations[ri] = {coms: [], subs: []};

    if (commandsAndSubscriptions.coms) {
      for (let c in commandsAndSubscriptions.coms) {
        console.info('registering', c, commandsAndSubscriptions.coms[c]);
        this.session.register(c, commandsAndSubscriptions.coms[c])
          .then(ci => this.registrations[ri].coms.push(ci))
          .catch(error => console.error('Wamp register ' + c + ' error:', error.error));
      }
    }
    if (commandsAndSubscriptions.subs) {
      for (let s in commandsAndSubscriptions.subs) {
        console.info('subscribing', s, commandsAndSubscriptions.subs[s]);
        this.session.subscribe(s, commandsAndSubscriptions.subs[s])
          .then(ci => this.registrations[ri].subs.push(ci))
          .catch(error => console.error('Wamp subscribe ' + s + 'error:', error.error));
      }
    }

    this._ri++;

    return ri;
  }

  /**
   * registered index
   * @param ri
   */
  public unregister(ri) {
    if (this.registrations[ri]) {
      console.info('WampService@unregister', ri);
      this.registrations[ri].coms.forEach(cr => cr.unregister());
      this.registrations[ri].subs.forEach(cs => cs.unsubscribe());

      delete this.registrations[ri];
    }
  }

  /**
   *
   * @param {string} host
   * @returns {boolean}
   */
  public connect(host: string) {

    console.info('connecting', host);

    // disconnect current server
    let currentServer = this.serversManager.getCurrentServer();
    if (currentServer && this.serversManager.isConnected(currentServer.host)) {
      this.disconnect(currentServer.host);
    }

    let server = this.serversManager.getServer(host);
    if (!server) {
      console.warn('WampService@connect', 'servers not ready yet ?');
      return false;
    }
    if (!this.serversManager.canConnect(server)) {
      console.warn('WampService@connect', 'attempt to reconnect', server);
      return false;
    }

    this.serversManager.setServer(host);

    let opts = this.getConnectionOptions(host);
    let conn = new autobahn.Connection(opts);

    this.serversManager.setConnecting(host, true);

    conn.onopen = (session => {
      console.info('WAMP Opened: ', session);
      this.session = session;
      this.queue.send(session);
      this.subj.next(session);
      this.onOpen.next(server);
      this.serversManager.setSession(host, session);
      if (currentServer) {
        this.serverSwitched.next([currentServer, server]);
      }

      this.connected.next(host);
    });

    conn.onclose = (reason => {
      console.info('WAMP Closed: ', reason);
      this.onClose.next({server, reason});
      this.serversManager.close(host);
      this.disconnected.next(host);

      return true;
    });

    conn.open();

    return true;
  }

  disconnect(host: string) {
    this.serversManager.getSession(host).leave('disconnect', 'have to go');
  }

  /**
   *
   * @returns {boolean}
   */
  private unregisterAll() {
    console.info('unregister all wamp subscriptions and commands');
    for (let ri in this.registrations) {
      this.unregister(ri);
    }

    return true;
  }

  /**
   *
   * @param {string} host
   * @returns {{url: string; realm: string}}
   */
  private getConnectionOptions(host: string) {
    return {
      url: Server.getWampHost(
        this.serversManager.getServer(host)
      ), realm: 'playlist'
    }
  }

  /*
  private loadServers() {
    this.serversManager.ready()
      .then(servers => {
//        if (!servers.length) {
//          this.serversManager.add(this.configService.get('wampHost'));
//        }

        // this.serversManager.each(
        //   server => this.connect(server)
        // );

        this.config.settings$.subscribe(settings => {
          if (settings && settings.server) {
            if (this.server != settings.server) {
              let server: Server;
              if (this.server) {
                server = this.serversManager.getServer(this.server);
                server && this.disconnect(server);
              }
              if (settings.server) {
                server = this.serversManager.getServer(settings.server);
                server && this.connect(server);
              }
            }
          }
        })
      })
      .catch(error => error);
  }

  */


}
