import * as React from 'react';
import { Question } from './Question';

export class TestSet {

    public questions: Question[] = [];

    constructor(questions: Question[]){
        this.questions = questions.slice();
    }

    get resultMarkForTest(): number{

        var mark = 0;

        var sumTeacherSetMaxMark = this.questions.filter(qu => qu.flagTeacherSetMaxMark === true).reduce((sum, qu) => sum + qu.maxMarkForQuestion, 0);
        var teacherCoef = sumTeacherSetMaxMark > 100 ? 100/sumTeacherSetMaxMark : 1.0;
        mark += this.questions.filter(qu => qu.flagTeacherSetMaxMark === true).reduce((sum, qu) => sum + qu.resultMarkForQuestion * teacherCoef, 0);

        if (sumTeacherSetMaxMark < 100){
            var sumAutoMaxMark = this.questions.filter(qu => qu.flagTeacherSetMaxMark === false).reduce((sum, qu) => sum + qu.maxMarkForQuestion, 0);
            var autoCoef = sumAutoMaxMark > (100 - sumTeacherSetMaxMark) ? (100 - sumTeacherSetMaxMark)/sumAutoMaxMark : 1.0;
            mark += this.questions.filter(qu => qu.flagTeacherSetMaxMark === false).reduce((sum, qu) => sum + qu.resultMarkForQuestion * autoCoef, 0);
        }

        if (sumTeacherSetMaxMark + sumAutoMaxMark == 0){
            return 100;
        }

        if (mark == 0){
            return mark;
        }

        if (sumTeacherSetMaxMark * teacherCoef + sumAutoMaxMark * autoCoef < 100){
            let resultCoef = 100/(sumTeacherSetMaxMark * teacherCoef + sumAutoMaxMark * autoCoef);
            mark *= resultCoef;
        }

        return mark;
    }

    public addNewQuestion(question: Question){
        return this.questions.push(question);
    }
}
