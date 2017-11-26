import { BrowserModule        } from '@angular/platform-browser';
import { NgModule             } from '@angular/core';
import { FormsModule          } from '@angular/forms';
import { HttpModule           } from '@angular/http';

import { AppComponent         } from './app.component';
import { AppRoutingModule     } from './app.routing.module';
import { StationListComponent } from './components/stationList.component';
import { RadikoService        } from './services/radiko.service';
import { ProgramListComponent } from './components/programList.component';
import { ConfigComponent      } from './components/config.component';
import { ConfigService        } from './services/config.service';
import { LibraryComponent     } from './components/library.component';
import { Setting              } from './setting';
import { PlayerComponent      } from './components/player.component';
import { StateService         } from './services/state.service';
import {LibraryService} from "./services/library.service";


@NgModule({
    declarations: [
        AppComponent,
        StationListComponent,
        ProgramListComponent,
        ConfigComponent,
        LibraryComponent,
        PlayerComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule
    ],
    providers: [
        RadikoService,
        ConfigService,
        StateService,
        LibraryService,
        Setting
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
