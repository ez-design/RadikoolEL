import {Http, Headers, ResponseContentType} from '@angular/http';
import {Injectable} from '@angular/core';
import {IConfig} from '../interfaces/config.interface';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Utility} from '../utility';

@Injectable()
export class ConfigService{
    public config:BehaviorSubject<IConfig> = new BehaviorSubject<IConfig>({});

    constructor(){
        let json = localStorage.getItem('config');
        console.log(json);
        let config:IConfig = {saveDir: 'records'};
        if(json) {
            config = JSON.parse(json);
            config.radikoEmail = Utility.decrypt(config.radikoEmail);
            config.radikoPassword = Utility.decrypt(config.radikoPassword);
        }
        this.config.next(config);
    }

}