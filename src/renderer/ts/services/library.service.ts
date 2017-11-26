import {Injectable} from '@angular/core';
import {IConfig} from '../interfaces/config.interface';
import {ILibrary} from "../interfaces/library.interface";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StateService} from "./state.service";
import {ConfigService} from "./config.service";
import {IProgram} from "../interfaces/program.interface";

let path = require('path');
@Injectable()
export class LibraryService{
    public libraries:BehaviorSubject<ILibrary[]> = new BehaviorSubject<ILibrary[]>([]);

    private config: IConfig;

    constructor(private stateService: StateService,
                private configService: ConfigService ){

        this.stateService.isDownloading.subscribe(value =>{
            if(!value){
                this.config = this.configService.config.getValue();
                this.refresh();
            }
        });
    }

    /**
     * ライブラリ取得
     * @param stationId
     * @param {IProgram} program
     * @returns {ILibrary}
     */
    public getLibrary = (stationId, program :IProgram) =>{
        return this.libraries.getValue().filter(l => l.fullName.indexOf(program.title) != -1 && l.fullName.indexOf(stationId) != -1 && l.fullName.indexOf(program.ft.substr(0, 8)) != -1)[0];
    };

    /**
     * 更新
     */
    public refresh = () => {

        let klaw = require('klaw');
        let path = require('path');
        let files:ILibrary[] = [];
        let kl = klaw(this.config.saveDir)
            .on('readable', () => {
                var item
                while ((item = kl.read())) {
                    if (!item.stats.isDirectory()) {
                        let size;
                        if(item.stats.size < 1000){
                            size = item.stats.size + 'B';
                        } else if(item.stats.size < 1000000){
                            size = Math.round((item.stats.size / 1000)) + 'KB';
                        } else {
                            size = (item.stats.size / 1000000).toFixed(1) + 'MB';
                        }

                        files.push({
                            name: path.basename(item.path),
                            lastUpdate: item.stats.mtime,
                            size: size,
                            fullName: item.path
                        });
                    }
                }

            })
            .on('end', () => {
                files.sort((a, b) => {
                    if (a.lastUpdate > b.lastUpdate) {
                        return -1;
                    }
                    if (a.lastUpdate < b.lastUpdate) {
                        return 1;
                    }
                    return 0;
                });

                this.libraries.next(files);
            });

    };

}