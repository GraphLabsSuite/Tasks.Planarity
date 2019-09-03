import { BetaGraph } from './../BetaGraph';
import { Question } from './Question';

export class SimpleQuestion extends Question {

    private planarity : boolean = null;

    constructor(planarity?: boolean, numVertisec?: number, maxPoint?: number){
        super(maxPoint);

        if (!planarity){
            this.planarity = Math.random() >= 0.5;
        } else {
            this.planarity = planarity;
        }

        if (!numVertisec){
            numVertisec = Math.floor(Math.random() * (20 - 5)) + 5;
        }

        this.examineGraph = this.createGraph(this.planarity, numVertisec);
    }

    public checkAnswer (answer: boolean): number{
        this.resultPoint = this.maxPoint * Number(this.planarity === answer);        
        return this.resultPoint;
    }

    private createGraph (planarity?: boolean, numVertisec?: number): BetaGraph{

        //TODO
        
        return new BetaGraph(null, null);
    }
}
