import * as React from 'react';
import { BetaGraph } from './BetaGraph';

export class Question {

    public maxMarkForQuestion : number = 100;
    public flagTeacherSetMaxMark: boolean = false;
    public resultMarkForQuestion : number = 0;
    
    public examineGraph : BetaGraph = null;
    public textQuestion : string = "";
    public flagShowTrueAnswer : boolean = false;

    private planarity : boolean = null;

    constructor(planarity?: boolean, numVertisec?: number, maxMark?: number){
        
        if (!planarity){
            this.planarity = Math.random() >= 0.5;
        } else {
            this.planarity = planarity;
        }

        if (!numVertisec){
            numVertisec = Math.floor(Math.random() * (20 - 5)) + 5;
        }

        if (maxMark){
            this.maxMarkForQuestion = maxMark;
            this.flagTeacherSetMaxMark = true;
        }

        this.examineGraph = this.createGraph(this.planarity, numVertisec);
    }

    public checkAnswer (answer: boolean): number{
        this.resultMarkForQuestion = this.maxMarkForQuestion * Number(this.planarity === answer);        
        return this.resultMarkForQuestion;
    }

    private createGraph (planarity?: boolean, numVertisec?: number): BetaGraph{

        //TODO
        
        return new BetaGraph(null, null);
    }
}
