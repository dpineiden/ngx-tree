import { NgModule } from '@angular/core';
import { ChartCommonModule } from '@swimlane/ngx-charts'
import { TreeGraphComponent } from './tree-graph.component'

@NgModule({
    imports: [ChartCommonModule],
    declarations: [
        TreeGraphComponent
    ],
    exports: [
        TreeGraphComponent
    ]
})

export class TreeGraphModule { }
