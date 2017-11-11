import {Component, OnInit} from '@angular/core';
import {IStation} from './interfaces/station.interface';
import {ILibrary} from './interfaces/library.interface';
import {IFavorite} from './interfaces/favorite.interface';
import {StateService} from './services/state.service';
import {RadikoService} from "./services/radiko.service";


interface IWebViewEvent extends Event{
    url:string;
}

class WebView extends HTMLElement{
    public getURL = ():string => { return ''};
    public stop = () =>{};
}

@Component({
    selector: 'App',
    template: `
        <div id="main">
            <nav class="nav has-shadow">
                    <div class="nav-menu nav-left">
                        <a class="nav-item is-tab" [class.is-active]="tool == 'info'" (click)="tool = 'info'">おしらせ</a>
                        <a class="nav-item is-tab" [class.is-active]="tool == 'programs'" (click)="tool = 'programs'">番組表</a>
                        <a class="nav-item is-tab" [class.is-active]="tool == 'library'"  (click)="tool = 'library'">ライブラリ</a>
                        <a class="nav-item is-tab" [class.is-active]="tool == 'favorite'" (click)="tool = 'favorite'">お気に入り</a>
                    </div>
                    <div class="nav-menu nav-right">
                        <a class="nav-item is-tab" [class.is-active]="tool == 'config'" (click)="tool = 'config'">設定</a>
                    </div>
            </nav>
            <div id="content">
                <div id="webview-container" [hidden]="tool != 'info'">
                </div>
                <ng-container *ngIf="tool == 'programs'">
                    <div style="width: 250px">
                        <StationList (selectStation)="onSelectStation($event)"></StationList>
                    </div>
                    <div style="width: 75%; flex-grow: 1">
                        <ProgramList [station]="station" *ngIf="station"></ProgramList>
                    </div>
                </ng-container>
                <div [hidden]="tool != 'library'" style="width: 100%">
                    <Library (play)="onPlay($event)"></Library>
                </div>
                <div [hidden]="tool != 'favorite'" style="width: 100%">
                    <Favorite (play)="onPlay($event)"></Favorite>
                </div>
                <div *ngIf="tool == 'config'" style="width: 100%">
                    <Config></Config>
                </div>
            </div>
            <Player [file]="playingFile"></Player>
            <div class="modal" [class.is-active]="loading">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">ダウンロード中です</p>
                    </header>
                    <section class="modal-card-body">
                        <progress class="progress is-primary" [value]="downloadProgress" max="100"></progress>
                    </section>
                    <footer class="modal-card-foot has-text-right" style="display: block">
                        <a class="button" (click)="onClickCancel()">キャンセル</a>
                    </footer>
                </div>
            </div>
        </div>
        
    `
})
export class AppComponent implements OnInit{
    private station:IStation;
    private tool:string = 'info';
    private loading:boolean = false;
    private downloadProgress:string = '';


    private playingFile:ILibrary;
    
    ngOnInit() {
        const startPage = 'https://www.radikool.com/start/?ver=el0.1.0';
        let webview = document.createElement('webview') as WebView;
        document.getElementById('webview-container').appendChild(webview);
        webview.setAttribute('src', startPage);
        webview.style.width = '100%';
        webview.style.height = '100%';

        this.stateService.isDownloading.subscribe(value => {
            this.loading = value;
        });

        this.stateService.downloadProgress.subscribe(value => {
            this.downloadProgress = value;
        });

        const shell = require('electron').shell;
        console.log(shell);

        webview.addEventListener('new-window', (e: IWebViewEvent) => {
            shell.openExternal(e.url);
        });

        webview.addEventListener('will-navigate', (e: IWebViewEvent) => {
            webview.stop();
            console.log(e.url);
            e.preventDefault();
            shell.openExternal(e.url);
            return false;
        });
        webview.addEventListener('dom-ready', (e: IWebViewEvent) => {
            webview.addEventListener('did-start-loading', (e) => {
                    webview.stop();
            });
        });
    }

    constructor(
        private stateService: StateService,
        private radikoService: RadikoService) {
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            return false;
        });


    }


    private onSelectStation = (station:IStation) =>{
        this.station = station;
    };

    private onPlay = (library:ILibrary) =>{
        this.playingFile = library;
    };

    private onClickCancel = () =>{
        let dialog = require('electron').remote.dialog;
        dialog.showMessageBox(null, {
            type: 'info',
            buttons: ['OK', 'Cancel'],
            title: '確認',
            message: '確認',
            detail: 'ダウンロードをキャンセルしますか？'
        }, res =>{
            if(res == 0){
                this.radikoService.cancelDownload();
            }
        });
    };
}
