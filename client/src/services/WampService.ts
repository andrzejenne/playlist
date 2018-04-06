import {Injectable} from '@angular/core';
import {ConfigService} from "./ConfigService";
import autobahn, {ICallOptions, IPublication, IPublishOptions, IRegistration, ISubscription} from "autobahn";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable, Subscription} from "rxjs";
import {skipWhile} from "rxjs/operators";

export interface SessionSubScriptionFunction {
    (session: autobahn.Session): void;
}

@Injectable()
export class WampService {

    private session: autobahn.Session;

    private subj: BehaviorSubject<autobahn.Session>;

    private obs: Observable<autobahn.Session> = null;

    private registrations: { [index: number]: { coms: IRegistration[], subs: ISubscription[] } } = {}; // @todo - proper interface

    private _ri = 1;

    constructor(private configService: ConfigService) {

        this.subj = new BehaviorSubject<autobahn.Session>(null);

        this.obs = this.subj.asObservable().pipe(skipWhile(ses => !ses));

        let conn = new autobahn.Connection({url: this.configService.get('wampHost'), realm: 'playlist'});

        conn.onopen = (session => {
            this.session = session;
            this.subj.next(session);
        });

        conn.onclose = (reason => {
            console.info('WAMP Closed: ', reason);

            return true;
        });

        conn.open();

        Observable.fromEvent(window, 'beforeunload').subscribe(event => this.unregisterAll());
    }

    get subscribe(): (callback: SessionSubScriptionFunction) => Subscription {
        return this.obs.subscribe.bind(this.obs);
    }

    get publish(): (topic: string, args?: any[], kwargs?: any, options?: IPublishOptions) => When.Promise<IPublication> {
        return this.session.publish.bind(this.session);
    }

    get call(): <TResult>(procedure: string, args?: any[], kwargs?: any, options?: ICallOptions) => When.Promise<TResult> {
        return this.session.call.bind(this.session);
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
     * @returns {boolean}
     */
    private unregisterAll() {
        console.info('unregister all wamp subscriptions and commands');
        for (let ri in this.registrations) {
            this.unregister(ri);
        }

        return true;
    }

}
