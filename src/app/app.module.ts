import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { TreeGraphModule } from './tree-graph/tree-graph.module'

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        TreeGraphModule,
        BrowserAnimationsModule,

    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
