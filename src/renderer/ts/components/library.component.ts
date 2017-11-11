import {Component, OnInit, OnDestroy, Output, EventEmitter, Input} from '@angular/core';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';
import {ILibrary} from "../interfaces/library.interface";
import {StateService} from "../services/state.service";


@Component({
    selector: 'Library',
    template: `
        <table class="table is-striped is-narrow">
            <tbody>
                <tr *ngFor="let file of files">
                    <td>{{file.name}}</td>
                    <td class="datetime">{{file.lastUpdate | date:'yyyy/MM/dd HH:mm:ss'}}</td>
                    <td>{{file.size}}</td>
                    <td class="has-text-right">
                        <button class="button is-small" type="button" (click)="onClick(file)">
                            <span class="icon">
                                <i class="fa fa-play-circle" aria-hidden="true"></i>
                            </span>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        
    `
})
export class LibraryComponent implements OnInit, OnDestroy{

    @Output()
    private play:EventEmitter<ILibrary> = new EventEmitter<ILibrary>();

    private config:IConfig;
    private files: ILibrary[] = [];

    private sub;

    ngOnInit() {
        this.sub = this.stateService.isDownloading.subscribe(value =>{
           if(!value){
               this.config = this.configService.config.getValue();
               this.refresh();
           }
        });

    }

    ngOnDestroy(){
        this.sub.unsubscribe();
    }

    constructor(
        private stateService: StateService,
        private configService: ConfigService){}

    public refresh = () => {
        let klaw = require('klaw');
        let path = require('path');
        let files = [];
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

                this.files = files;
                console.log(this.files);
            });

    };

    private onClick = (library:ILibrary) =>{
        this.play.emit({name: library.fullName, fullName: 'file://' + library.fullName, size: library.size, lastUpdate: library.lastUpdate});
    }
}
