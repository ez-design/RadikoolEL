const crypto = require('crypto');
export class Utility{

    /**
     * オプジェクトをコピーする
     * @param src
     * @returns {T}
     */
    public static copy<T>(src:T){
        //let res = {};
        //for(let key in src){
        //    res.[key] = src[key];
        //}
        let res = JSON.parse(JSON.stringify(src))
        return res as T;
    };

    /**
     * 暗号化
     * @param src
     * @returns {string}
     */
    public static encrypt = (src) =>{
        try {
            let cipher = crypto.createCipher('aes-256-cbc', 'cryptKey');
            return cipher.update(src, 'utf-8', 'base64') + cipher.final('base64');
        } catch(e) {
            console.log(e);
            return '';
        }
    };

    /**
     * 復号化
     * @param src
     * @returns {string}
     */
    public static decrypt = (src) =>{
        try {
            var decipher = crypto.createDecipher('aes-256-cbc', 'cryptKey');

            return decipher.update(src, 'base64', 'utf8') + decipher.final('utf8');
        } catch(e){
            console.log(e);
            return '';
        }
    };


    /**
     * 時間(秒)を取得
     * @param from
     * @param to
     * @returns {number}
     */
    public static getDuration = (from:string, to:string) => {
        let d1 = new Date(parseInt(from.substr(0, 4), 10), parseInt(from.substr(4, 2), 10) -1, parseInt(from.substr(6, 2), 10), parseInt(from.substr(8, 2), 10), parseInt(from.substr(10, 2), 10));
        let d2 = new Date(parseInt(to.substr(0, 4), 10), parseInt(to.substr(4, 2), 10) -1, parseInt(to.substr(6, 2), 10), parseInt(to.substr(8, 2), 10), parseInt(to.substr(10, 2), 10));
        let duration = Math.round((d2.getTime() - d1.getTime()) / 1000);
        return duration;
    };
}