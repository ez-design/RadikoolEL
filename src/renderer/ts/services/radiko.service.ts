import {Http, Headers, ResponseContentType} from '@angular/http';
import {Injectable} from '@angular/core';
import 'rxjs';
import {IProgram} from '../interfaces/program.interface';
import {Observable} from 'rxjs/Observable';
import * as Path from "path";
import {Utility} from "../utility";

let app = require('electron').remote.app;
let process = require('electron').remote.process;
const libDir = (process.platform == 'darwin')　? '/usr/local/bin' : Path.join(app.getAppPath(), 'libs', process.platform);
console.log("libDir: "+ libDir);

@Injectable()
export class RadikoService{
    private swfextract;
    private ffmpeg;


    constructor(
        private http: Http){

        var fs = require('fs-extra');
        if (!fs.existsSync('tmp')){
            fs.mkdirsSync('tmp');
        }
    }

    /**
     * 放送局取得
     * @returns {Observable<Response>}
     */
    public getStations = (areaId?:string) =>{
        if(areaId){
            return this.http.get('http://radiko.jp/v3/station/list/' + areaId + '.xml');
        } else {
            return this.http.get('http://radiko.jp/v3/station/region/full.xml');
        }

    };

    /**
     * 番組データ取得
     * @param id
     */
    public getPrograms = (id: string) =>{
        return this.http.get('http://radiko.jp/v3/program/station/weekly/' + id + '.xml');

    };


    /**
     * radikoプレミアムログインチェック
     * @returns {Observable<Response>}
     */
    public checkLogin = () =>{
        return this.http.get('https://radiko.jp/ap/member/webapi/member/login/check');
    };

    /**
     * 都道府県取得
     * @returns {Observable<Response>}
     */
    public getAreaId = () =>{
        return this.http.get('http://radiko.jp/area/').map(res =>{
           return (res.text().match(/JP[0-9]+/gi))[0];
        });
    };



    /**
     * トークン取得
     * @param callback
     */
    public getToken = (callback) =>{
        let headers = new Headers();

        headers.append("X-Radiko-App", "pc_ts");
        headers.append("X-Radiko-App-Version", "4.0.0");
        headers.append("X-Radiko-User", "test-stream");
        headers.append("X-Radiko-Device", "pc");

        this.http.post('https://radiko.jp/v2/api/auth1_fms', {}, {headers: headers}).subscribe(res =>{
            let token = res.headers.get('x-radiko-authtoken');
            let length = parseInt(res.headers.get('x-radiko-keylength'), 10);
            let offset = parseInt(res.headers.get('x-radiko-keyoffset'), 10);

            var fs = require('fs');
            var request = require('request');

            this.getSwf(swf => {
                var spawn = require('child_process').spawn;

                this.swfextract = spawn(Path.join(libDir, 'swfextract'), ['-b', '12', swf, '-o', Path.join('tmp', 'image.png')]);
                this.swfextract.on('exit', () => {
                    fs.open('tmp/image.png', 'r', (err, fd) => {

                        var buffer = new Buffer(length);
                        fs.readSync(fd, buffer, 0, length, offset);
                        let partial_key = buffer.toString('base64');

                        let headers = new Headers();
                        headers.append("pragma", "no-cache");
                        headers.append("X-Radiko-App", "pc_ts");
                        headers.append("X-Radiko-App-Version", "4.0.0");
                        headers.append("X-Radiko-User", "test-stream");
                        headers.append("X-Radiko-Device", "pc");
                        headers.append("X-Radiko-AuthToken", token);
                        headers.append("X-Radiko-Partialkey", partial_key);
                        this.http.post('https://radiko.jp/v2/api/auth2_fms', {}, { headers: headers }).subscribe(res =>{
                            callback(token);
                        });
                    });
                });
            });
        });
    };

    /**
     * タイムフリー取得
     * @param program
     * @param callback
     */
    public getTimeFree = (stationId: string, program:IProgram, saveDir:string, progress, callback) => {
        this.getToken((token) => {
            let headers = new Headers();
            headers.append('pragma', 'no-cache');
            headers.append('X-Radiko-AuthToken', token);

            let filename = program.title + '.aac';
            let path = require('path');
            //filename = path.join(saveDir, stationId, program.ft.substr(0, 8), filename);
            filename = path.join(saveDir, program.ft.substr(0,8) + "-"  + program.title + ".aac");

            var fs = require('fs-extra');
            var dir = path.dirname(filename);
            if (!fs.existsSync(dir)){
                fs.mkdirsSync(dir);
            }

            let duration = Utility.getDuration(program.ft, program.to);
            this.http.post('https://radiko.jp/v2/api/ts/playlist.m3u8?station_id=' + stationId + '&ft=' + program.ft + '&to=' + program.to, {}, {headers: headers}).subscribe(res => {
                let m3u8 = '';
                let lines = res.text().split(/\r\n|\r|\n/);
                for(let i=0 ; i< lines.length ; i++) {
                    if(lines[i].indexOf('http') != -1){
                        m3u8 = lines[i];
                        break;
                    }
                }

                if(m3u8 != ''){
                    if(saveDir) {
                        var spawn = require('child_process').spawn;
                        this.ffmpeg = spawn(Path.join(libDir, 'ffmpeg'), ['-i', m3u8, '-acodec', 'copy', filename]);
                        let duration = Utility.getDuration(program.ft, program.to);
                        this.ffmpeg.stdout.on('data', (data) => {
                        });
                        this.ffmpeg.stderr.on('data', (data) => {
                            /**
                             * File 'records/TBS/20171029/小森谷徹 週刊！暮らしの便利帳.aac' already exists. Overwrite ? [y/N] "
                             */
                            let existing = 'already exists. Overwrite ?';
                            let mes = data.toString();
                            if(mes.indexOf(existing) != -1){
                                console.log(mes);
                                this.ffmpeg.kill();
                                this.ffmpeg = null;
                                console.log("!!! ffmpeg terminated. !!!")
                                callback();
                            }else if(mes.indexOf('size') != -1){

                                let m = mes.match(/time=([0-9:.]+)/);
                                if(m[1]){
                                    let sec = parseInt(m[1].split(':')[0], 10) * 3600 + parseInt(m[1].split(':')[1], 10) * 60 + parseInt(m[1].split(':')[2], 10);

                                    progress(Math.round((sec / duration) * 100));
                                }


                             //   progress(mes);
                            }
                        });
                        this.ffmpeg.on('exit', () => {
                            this.ffmpeg = null;
                            callback();
                        });

                    } else {
                        callback(m3u8);
                    }


                }

            });
        });
    };

    /**
     * ダウンロードキャンセル
     */
    public cancelDownload = () =>{
        if(this.ffmpeg){
            this.ffmpeg.kill();
            this.ffmpeg = null;
        }
    };


    /**
     * swf取得
     * @param callback
     */
    private getSwf = (callback) =>{
        let swf = Path.join('tmp', 'player.swf');

        let fs = require('fs');
        try {
            fs.accessSync(swf);
            callback(swf);

        } catch (e){
            // 無ければ取得
            this.http.get('http://radiko.jp/apps/js/flash/myplayer-release.swf', {responseType: ResponseContentType.Blob,}).subscribe(res =>{
                let reader = new FileReader();
                reader.onload = function () {
                    let fs = require('fs');
                    fs.writeFileSync(swf, new Buffer(new Uint8Array(reader.result)));

                    callback(swf);
                };
                reader.readAsArrayBuffer(res.blob());
            });
        }
    };
}