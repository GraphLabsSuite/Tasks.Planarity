import * as React from 'react';
import { BetaGraph } from './../BetaGraph';

export class Question {

    public maxPoint : number = 100;
    public flagTeacherMaxPoint: boolean = false;
    public resultPoint : number = 0;
    
    public examineGraph : BetaGraph = null;
    public textQuestion : string = "";
    public flagShowTrueAnswer : boolean = false;

    constructor(maxPoint?: number){

        if (maxPoint){
            this.maxPoint = maxPoint;
            this.flagTeacherMaxPoint = true;
        }
    }
}
