import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';

import autobahn from 'autobahn';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  session: autobahn.Session;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // alert('conn');

      let conn = new autobahn.Connection({url: 'ws://localhost:9090', realm: 'playlist' });

      conn.onopen = (session => {
        this.session = session;

        this.session.subscribe('playlist.hi', (...args) => {
          console.info('callback', ...args);
        }).then((...args) => {
            console.info(...args);
        }).catch(error => {
          console.error(error);
        });

        // this.session.register('playlist.hi', () => {
        //   console.info('hi');
        // });

        this.session.call('playlist.hello');
      });

      conn.open();
    });
  }
}

