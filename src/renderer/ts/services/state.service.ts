import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class StateService {
    public isDownloading:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public downloadProgress:BehaviorSubject<string> = new BehaviorSubject<string>('');
}