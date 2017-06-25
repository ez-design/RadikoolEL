import { Component } from '@angular/core';

@Component({
    selector: 'App',
    template: `
        <nav class="nav has-shadow">
            <div class="container">
                <div class="nav-menu nav-left">
                    <a class="nav-item" [routerLink]="['form']">フォーム</a>
                    <a class="nav-item" [routerLink]="['setting']">管理</a>
                </div>
                <div class="nav-menu nav-right">
                    <a class="nav-item" href="./logout">ログアウト</a>
                </div>
            </div>
        </nav>
        
        <div class="container" style="padding-top: 30px">
            <router-outlet></router-outlet>
        </div>
        <StationList></StationList>
    `
})
export class AppComponent {
}
