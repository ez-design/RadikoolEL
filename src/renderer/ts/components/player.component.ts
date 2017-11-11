import {Component, OnInit, OnDestroy, Output, EventEmitter, Input, OnChanges} from '@angular/core';
import {ILibrary} from "../interfaces/library.interface";

@Component({
    selector: 'Player',
    template: `
        <div id="player" *ngIf="file">
            <div class="container" >
                <div class="box">
                    <p>{{file.name}}</p>
                    <audio [src]="file.fullName" autoplay controls></audio>
                </div>
            </div>
        </div>
    `
})
export class PlayerComponent implements OnInit, OnDestroy, OnChanges {
    @Input()
    private file:ILibrary;

    ngOnInit(){

    }

    ngOnDestroy(){

    }

    ngOnChanges(){

    }

    constructor(){

    }
}