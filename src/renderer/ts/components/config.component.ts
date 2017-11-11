import {Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {RadikoService} from '../services/radiko.service';
import {ConfigService} from '../services/config.service';
import {IConfig} from '../interfaces/config.interface';
import {Utility} from "../utility";

@Component({
    selector: 'Config',
    template: `
        <form (ngSubmit)="onSubmit()">
            <div class="message">
                <div class="message-header">
                    <p>radikoプレミアム</p>
                </div>
                <div class="message-body">
                    <button type="button" class="button" (click)="isOpenForm = true" *ngIf="!isLogin && !isOpenForm">ログイン</button>
                    <button type="button" class="button" (click)="isOpenForm = true" *ngIf="isLogin && !isOpenForm">ログアウト</button>
                    <button type="button" class="button" (click)="onClickCloseForm()" *ngIf="isOpenForm">閉じる</button>
                    <iframe src="http://radiko.jp/" style="width:100%; height: 300px;" *ngIf="isOpenForm && isLogin"></iframe>
                    <iframe src="https://radiko.jp/ap/member/login/login_page" style="width:100%; height: 300px;" *ngIf="isOpenForm && !isLogin"></iframe>
                </div>
            </div>
            <div class="message">
                <div class="message-header">
                    <p>一般設定</p>
                </div>
                <div class="message-body">
                    <div class="field ">
                            <label class="label">保存パス</label>

                        <div class="field has-addons">
                            <p class="control">
                                <input class="input" type="text" name="saveDir" [(ngModel)]="config.saveDir" placeholder="保存パス">
                            </p>
                            <p class="control">
                                <button class="button" type="button" (click)="onClickSaveDir()">
                                <span class="icon is-small">
                                    <i class="fa fa-folder-open-o"></i>
                                </span>
                                </button>
                            </p>
                        </div>
                        
                    </div>
                </div>
            </div>
            <button type="submit" class="button is-primary">保存</button>
        </form>　
        
    `
})
export class ConfigComponent implements OnInit, OnDestroy {
    private config:IConfig = {};
    private loading = false;
    private isLogin = false;
    private isOpenForm = false;
    ngOnInit() {
        console.log(__dirname);
        this.configService.config.subscribe(value =>{
            this.config = Utility.copy<IConfig>(value);
        });
        this.radikoService.checkLogin().subscribe(res => {
            this.isLogin = true;
        }, res =>{
            this.isLogin = false;
        });
    }

    ngOnDestroy() {

    }

    constructor(
                private chRef: ChangeDetectorRef,
                private configService: ConfigService,
                private radikoService: RadikoService) {
    }


    /**
     * iframeを閉じる
     */
    private onClickCloseForm = () =>{
        this.radikoService.checkLogin().subscribe(res => {
            this.isLogin = true;
        }, res =>{
            this.isLogin = false;
        });

        this.isOpenForm = false;
    };


    /**
     * 録音パス選択
     */
    private onClickSaveDir = () =>{
        let dialog = require('electron').remote.dialog;
        dialog.showOpenDialog(null, {
            properties: ['openDirectory']
        }, (dir) => {
            this.config.saveDir = dir[0];
            this.chRef.detectChanges();
        });
    };

    /**
     * 設定保存
     */
    private onSubmit = () => {

        let save = Utility.copy<IConfig>(this.config);
        localStorage.setItem('config', JSON.stringify(save));
        this.configService.config.next(save);
    };




}
