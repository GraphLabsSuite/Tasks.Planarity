import * as React from 'react';
import { BetaGraph } from './BetaGraph';
import { store, TaskTemplate, TaskToolbar, ToolButtonList } from 'graphlabs.core.template';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Graph, Vertex, Edge, VertexJSON } from 'graphlabs.core.graphs';
import { Cycle } from './Cycle';
import { element, number } from 'prop-types';
import { Segment } from './Segment';
import {ChangeEvent, SyntheticEvent} from "react";

function graph_optimize(){
    let betaGraph = Object.assign({}, store.getState().graph);
    
    betaGraph.vertices = betaGraph.vertices.filter((v: Vertex) => betaGraph.edges.find((e: IEdgeView) => e.vertexOne === v.name || e.vertexTwo === v.name ));
    
    let numVerticesDeleted: number = 0;
    let verticesMig; 
    
    do{
        verticesMig = betaGraph.vertices.filter((v: Vertex) => betaGraph.edges.filter((e: IEdgeView) => e.vertexOne === v.name || e.vertexTwo === v.name).length >= 2 );
        numVerticesDeleted = betaGraph.vertices.length - verticesMig.length;
        betaGraph.vertices = verticesMig;
        
        betaGraph.edges = betaGraph.edges.filter((e: IEdgeView) => betaGraph.vertices.find((v: Vertex) => v.name === e.vertexOne) && betaGraph.vertices.find((v: Vertex) => v.name === e.vertexTwo));
        
    } while(numVerticesDeleted != 0)

    return betaGraph;
}

function findWay(graphVertices: IVertexView[], graphEdges: IEdgeView[], startPoint: IVertexView, finishPoint: IVertexView[]) : Segment{
    
    var resultSegment :  Segment = new Segment([], [startPoint], startPoint, null);
    var blackList : IEdgeView[] = [];

    do {
        var nextEdge = graphEdges.find( edge => !resultSegment.bodyEdges.find(e => e == edge) && !blackList.find(e => e == edge)
            && (edge.vertexOne == resultSegment.bodyVertices[resultSegment.bodyVertices.length - 1].name
                || edge.vertexTwo == resultSegment.bodyVertices[resultSegment.bodyVertices.length - 1].name));
        
        if (nextEdge == null){
            if (resultSegment.bodyEdges.length == 0){
                return null;
            }
            blackList.push(resultSegment.bodyEdges.pop());
            resultSegment.bodyVertices.pop();
            continue;
        }

        resultSegment.bodyEdges.push(nextEdge);
        
        if (nextEdge.vertexOne == resultSegment.bodyVertices[resultSegment.bodyVertices.length - 1].name){
            resultSegment.bodyVertices.push(graphVertices.find(v => v.name == nextEdge.vertexTwo));
            resultSegment.contactPointTwo = graphVertices.find(v => v.name ==nextEdge.vertexTwo);
        } else {
            resultSegment.bodyVertices.push(graphVertices.find(v => v.name == nextEdge.vertexOne));
            resultSegment.contactPointTwo = graphVertices.find(v => v.name == nextEdge.vertexOne);
        }

    } while (!finishPoint.find(v => resultSegment.contactPointTwo.name == v.name))
    
    return resultSegment
}

function findCycle(graphVertices: IVertexView[], graphEdges: IEdgeView[] ) {

    if(graphVertices.length === 0){
        return null;
    }

    var resultCycle:Cycle = new Cycle("G0", [graphVertices[0]], null);

    let colored:IVertexView[] = [];

    let nextEdge = graphEdges.find((e: IEdgeView) => e.vertexOne === resultCycle.vertices[0].name || e.vertexTwo === resultCycle.vertices[0].name);
    
    if (nextEdge!=null){
        resultCycle.edges = [nextEdge];

        if (nextEdge.vertexOne === resultCycle.vertices[0].name){
            resultCycle.vertices = resultCycle.vertices.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
            colored = colored.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
        } else 
        {
            resultCycle.vertices = resultCycle.vertices.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
            colored = colored.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
        }
    }

    while (resultCycle.vertices[0] !== resultCycle.vertices[resultCycle.vertices.length - 1]){    
        nextEdge = graphEdges.find((e: IEdgeView) => e.vertexOne === resultCycle.vertices[resultCycle.vertices.length - 1].name && e.vertexTwo !== resultCycle.vertices[resultCycle.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexTwo) == null)
                                                   || e.vertexTwo === resultCycle.vertices[resultCycle.vertices.length - 1].name && e.vertexOne !== resultCycle.vertices[resultCycle.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexOne) == null));
        if (nextEdge!=null){
            resultCycle.edges = resultCycle.edges.concat([nextEdge]);

            if (nextEdge.vertexOne === resultCycle.vertices[resultCycle.vertices.length - 1].name){
                resultCycle.vertices = resultCycle.vertices.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
                colored = colored.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
            } else 
            {
                resultCycle.vertices = resultCycle.vertices.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
                colored = colored.concat([graphVertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
            }
        }
    }

    return resultCycle;
}

function findSegments(faces: Cycle[], graphVertices: IVertexView[], graphEdges: IEdgeView[], usedEdges: IEdgeView[], usedVertices: IVertexView[]): Segment[]{

    var resultSegments: Segment[] = [];

    //Search segments.
    graphEdges.filter(nonUsedEdge => !usedEdges.find(e => e == nonUsedEdge)).forEach(nonUsedEdge => {
        if (usedVertices.find(v => nonUsedEdge.vertexOne == v.name) && usedVertices.find(v => nonUsedEdge.vertexTwo == v.name)){
            resultSegments.push(new Segment([nonUsedEdge], 
                                            [graphVertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                            graphVertices.find(v => v.name == nonUsedEdge.vertexTwo)], 
                                            graphVertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                            graphVertices.find(v => v.name == nonUsedEdge.vertexTwo)));
        
        } else if (usedVertices.find(v => nonUsedEdge.vertexOne == v.name)){
            resultSegments.push(findWay(graphVertices, graphEdges.filter(edge => !usedEdges.find(e => e == edge)), graphVertices.find(v => v.name == nonUsedEdge.vertexOne), usedVertices));
        
        } else if (usedVertices.find(v => nonUsedEdge.vertexTwo == v.name)){
            resultSegments.push(findWay(graphVertices, graphEdges.filter(edge => !usedEdges.find(e => e == edge)), graphVertices.find(v => v.name == nonUsedEdge.vertexTwo), usedVertices));
        }
    });

    //Calculate value of each found segment
    resultSegments.forEach(s => s.value = faces.filter( f=> f.vertices.find(v => v.name == s.contactPointOne.name) && f.vertices.find(v => v.name == s.contactPointTwo.name)).length);

    return resultSegments;
}

function checkPlanarity(graphVertices: IVertexView[], graphEdges: IEdgeView[], zeroCycle: Cycle ) : boolean {

    if(zeroCycle == null){
        return true;
    }
    if(zeroCycle.vertices.length === 0){
        return true;
    }

    var faces: Cycle[] = [zeroCycle, new Cycle("G1", zeroCycle.vertices, zeroCycle.edges)];
    var usedEdges: IEdgeView[] = zeroCycle.edges;
    var usedVertices: IVertexView[] = zeroCycle.vertices;
    var segments : Segment[] = findSegments(faces, graphVertices, graphEdges, usedEdges, usedVertices);
    var counter = 0;
    
    while (segments.length != 0 && !segments.find(s => s.value == 0) && counter < 100){
        counter++;
        segments.sort(function(a, b) { return b.value - a.value; });

        var minValueSegment = segments.pop();
        var cutFace = faces.splice(faces.findIndex( f => f.vertices.find(v => v.name == minValueSegment.contactPointOne.name) != null && f.vertices.find(v => v.name == minValueSegment.contactPointTwo.name) != null), 1)[0];
        var contactPointOneIndex = cutFace.vertices.findIndex(v => v.name == minValueSegment.contactPointOne.name);
        var contactPointTwoIndex = cutFace.vertices.findIndex(v => v.name == minValueSegment.contactPointTwo.name);

        usedVertices = usedVertices.concat(minValueSegment.bodyVertices.slice(1, minValueSegment.bodyVertices.length - 1));
        usedEdges = usedEdges.concat(minValueSegment.bodyEdges.slice());

        var newVertices1 : IVertexView[];
        var newVertices2 : IVertexView[];
        var newEdges1 : IEdgeView[];
        var newEdges2 : IEdgeView[];

        if (contactPointOneIndex < contactPointTwoIndex){
            newVertices1 = cutFace.vertices.slice(0, contactPointOneIndex);
            newVertices1 = newVertices1.concat(minValueSegment.bodyVertices.slice());
            newVertices1 = newVertices1.concat(cutFace.vertices.slice(contactPointTwoIndex + 1));

            newEdges1 = cutFace.edges.slice(0, contactPointOneIndex);
            newEdges1 = newEdges1.concat(minValueSegment.bodyEdges.slice());
            newEdges1 = newEdges1.concat(cutFace.edges.slice(contactPointTwoIndex));

            newVertices2 = minValueSegment.bodyVertices.slice();
            newVertices2 = newVertices2.concat(cutFace.vertices.slice(contactPointOneIndex, contactPointTwoIndex).reverse());

            newEdges2 = minValueSegment.bodyEdges.slice();
            newEdges2 = newEdges2.concat(cutFace.edges.slice(contactPointOneIndex, contactPointTwoIndex).reverse());

        } else if (contactPointOneIndex > contactPointTwoIndex){
            newVertices1 = cutFace.vertices.slice(0, contactPointTwoIndex);
            newVertices1 = newVertices1.concat(minValueSegment.bodyVertices.slice().reverse());
            newVertices1 = newVertices1.concat(cutFace.vertices.slice(contactPointOneIndex + 1));

            newEdges1 = cutFace.edges.slice(0, contactPointTwoIndex);
            newEdges1 = newEdges1.concat(minValueSegment.bodyEdges.slice().reverse());
            newEdges1 = newEdges1.concat(cutFace.edges.slice(contactPointOneIndex));

            newVertices2 = minValueSegment.bodyVertices.slice().reverse();
            newVertices2 = newVertices2.concat(cutFace.vertices.slice(contactPointTwoIndex, contactPointOneIndex).reverse());

            newEdges2 = minValueSegment.bodyEdges.slice().reverse();
            newEdges2 = newEdges2.concat(cutFace.edges.slice(contactPointTwoIndex, contactPointOneIndex).reverse());

        } else if (contactPointOneIndex == contactPointTwoIndex){
            newVertices1 = cutFace.vertices.slice();
            newEdges1 = cutFace.edges.slice();
            newVertices2 = minValueSegment.bodyVertices.slice();
            newEdges2 = minValueSegment.bodyEdges.slice();
        }

        faces.push(new Cycle(cutFace.name + "0", newVertices1.slice(), newEdges1.slice()), new Cycle(cutFace.name + "1", newVertices2.slice(), newEdges2.slice()));
        segments = findSegments(faces, graphVertices, graphEdges, usedEdges, usedVertices);
    }

    if (segments.length == 0){
        return true;
    } else if (segments.find(s => s.value == 0)){
        return false;
    }

    return null;
}

function addK5Edges(){
    const graph = store.getState().graph;

    var newEdge : IEdgeView = graph.edges.slice(0,1);
    
    graph.vertices.forEach((v1: Vertex) => {
        graph.vertices.forEach((v2: Vertex) => {
            newEdge.vertexOne = v1.name;
            newEdge.vertexTwo = v2.name;
            graph.edges.push(Object.assign({}, newEdge));
        })
    });
}

function graphСheck(){
    const graph = store.getState().graph;
        
    /** Сheck graph state for defects. */

    //Duplicates

    graph.vertices.forEach((element: Vertex, index: Number) => {
        if (graph.vertices.filter((v: Vertex) => v.name == element.name).length > 1){
            graph.vertices.splice(index, 1);
        }
    });
    
    // + 2 edges from same vertices
    graph.edges.forEach((element: IEdgeView, index: Number) => {
        if (graph.edges.filter((e: IEdgeView) => e.vertexOne == element.vertexOne && e.vertexTwo == element.vertexTwo
                                                || e.vertexOne == element.vertexTwo && e.vertexTwo == element.vertexOne).length > 1){
            graph.edges.splice(index, 1);
        }
    });

    //Edges to nonexistent vertex
    graph.edges.forEach((element: IEdgeView, index: Number) => {
        if (!graph.vertices.find((v: Vertex) => v.name == element.vertexOne || v.name == element.vertexTwo)){
            graph.edges.splice(index, 1);
        }
    });

    //Zero value edges
    graph.edges.forEach((element: IEdgeView, index: Number) => {
        if (element.vertexOne == element.vertexTwo){
            graph.edges.splice(index, 1);
        }
    });
}

function mainCheck(){
    var beta_graph = graph_optimize();  
    return checkPlanarity(beta_graph.vertices, beta_graph.edges, findCycle(beta_graph.vertices, beta_graph.edges));
}

class App extends TaskTemplate {

    private studentAnswer?: boolean;

    constructor(props: {}) {
        super(props);
        this.checkAnswer = this.checkAnswer.bind(this);
    }


    public getTaskToolbar() {
        TaskToolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `В данном задании будет выполняться проверка 
            планарности графа.`;
            return ToolButtonList;
        };
        return TaskToolbar;
    }

    public task() {

        //addK5Edges();
        graphСheck();

        var planarity_result = mainCheck();
        
        var devstring = "";
        if (planarity_result == null){
            devstring += "Пожалуйста сообщите об этом преподавателю или лаборанту. Результат проверки на планарность = null";
        }

        return () => (
            <div>
                <form>
                    <span> Ответьте на вопрос: <br /> Данный граф является планарным ? </span>
                    <div className="radio">
                    <label>
                        <input
                            type="radio"
                            value="0"
                            checked={this.studentAnswer === true}
                            onChange={this.checkAnswer}
                        />
                        Да. Данный граф планарен.
                    </label>
                    </div>
                    <div className="radio">
                    <label>
                        <input
                            type="radio"
                            value="1"
                            onChange={this.checkAnswer}
                            checked={this.studentAnswer === false}
                        />
                        Нет. Данный граф не планарен.
                    </label>
                    </div>
                </form>
                <span> <br /> <br /> {devstring} </span>
            </div>
            );
    }

    private checkAnswer(value: ChangeEvent<HTMLInputElement>) {
        this.studentAnswer = value.target.value === '0';
        super.forceUpdate();
    }
}

export default App;
