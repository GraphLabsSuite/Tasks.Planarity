import { BetaGraph } from './../BetaGraph';
import { Question } from './Question';

export class ChoiceQuestion extends Question {

    private trueAnswer : boolean[] = [];

    constructor(trueAnswer: boolean[], maxPoint?: number){
        super(maxPoint);
        this.trueAnswer = trueAnswer.slice();
    }

    public checkAnswer (answer: boolean[]): number{
        if (this.trueAnswer.length != answer.length){
            return 0;
        }
        
        this.resultPoint = 0;
        for (let i = 0; i < this.trueAnswer.length; i++){
            this.resultPoint += Number(this.trueAnswer[i] == answer[i]) * this.maxPoint/this.trueAnswer.length;    
        }
             
        return this.resultPoint;
    }
}
