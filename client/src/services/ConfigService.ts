import {Injectable} from '@angular/core';
import config from '../config';

@Injectable()
export class ConfigService {
    config = config;

    get(path: string) {
        return path.split('.').reduce((o, i) => o[i], this.config);
    }

    isWebApp = document.URL.startsWith('http');
}