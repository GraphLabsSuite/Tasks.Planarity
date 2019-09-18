import * as React from 'react';
import { BetaGraph } from './BetaGraph';
import { store, Template, Toolbar, ToolButtonList, IEdgeView, IVertexView } from 'graphlabs.core.template';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import {ChangeEvent, SyntheticEvent} from "react";

var private_log_h2G4: string = "start; ";

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

function addBridge(){
    const graph = store.getState().graph;

    var newVertex = graph.vertices.slice(0,1);
    newVertex.name = "5";
    graph.vertices.push(newVertex);

    graph.edges.length = 1;

    var newEdge0 = graph.edges[0];
    newEdge0.vertexOne = "0";
    newEdge0.vertexTwo = "1";

    var newEdge1 = graph.edges.slice(0,1);
    newEdge1.vertexOne = "1";
    newEdge1.vertexTwo = "2";
    graph.edges.push(Object.assign({}, newEdge1));

    var newEdge2 = graph.edges.slice(0,1);
    newEdge2.vertexOne = "0";
    newEdge2.vertexTwo = "2";
    graph.edges.push(Object.assign({}, newEdge2));

    var newEdge3 = graph.edges.slice(0,1);
    newEdge3.vertexOne = "2";
    newEdge3.vertexTwo = "3";
    graph.edges.push(Object.assign({}, newEdge3));

    var newEdge01 = graph.edges.slice(0,1);
    newEdge01.vertexOne = "3";
    newEdge01.vertexTwo = "5";
    graph.edges.push(Object.assign({}, newEdge01));

    var newEdge11 = graph.edges.slice(0,1);
    newEdge11.vertexOne = "3";
    newEdge11.vertexTwo = "4";
    graph.edges.push(Object.assign({}, newEdge11));

    var newEdge21 = graph.edges.slice(0,1);
    newEdge21.vertexOne = "5";
    newEdge21.vertexTwo = "4";
    graph.edges.push(Object.assign({}, newEdge21));
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

class App extends Template {

    private studentAnswer?: boolean;
    private planarityResult?: boolean;

    constructor(props: {}) {
        super(props);
        this.checkAnswer = this.checkAnswer.bind(this);
    }

    public componentDidMount(){

        graphСheck();

        private_log_h2G4 += " g1.verts: ";
        store.getState().graph.vertices.forEach((v: Vertex) => {
            private_log_h2G4 += v.name;
        });
        private_log_h2G4 += " g1.edges: ";
        store.getState().graph.edges.forEach((e: Edge) => {
            private_log_h2G4 += "-" + e.vertexOne + e.vertexTwo + "-";
        });

        var betaGraph = new BetaGraph(store.getState().graph.vertices, store.getState().graph.edges);
        private_log_h2G4 += " gBetaGraph: " + betaGraph.toString();

        this.planarityResult = betaGraph.checkPlanarity();
        private_log_h2G4 += betaGraph.private_log_betagraph_6h;

        if (this.planarityResult == null){
            alert("Пожалуйста сообщите об этом преподавателю или лаборанту. Результат проверки на планарность = null");
        }
    }

    public getTaskToolbar() {
        Toolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `В данном задании будет выполняться проверка 
            планарности графа.`;
            return ToolButtonList;
        };
        return Toolbar;
    }

    public task() {
        
        //addK5Edges();
        //addBridge();

        private_log_h2G4 += " g0.verts: ";
        store.getState().graph.vertices.forEach((v: Vertex) => {
            private_log_h2G4 += v.name;
        });
        private_log_h2G4 += " g0.edges: ";
        store.getState().graph.edges.forEach((e: Edge) => {
            private_log_h2G4 += "-" + e.vertexOne + e.vertexTwo + "-";
        });

        this.componentDidMount();
        private_log_h2G4 += " actual_planarity_result: " + this.planarityResult.toString();

        return () => (
            <div>
                <form>
                    <span> Ответьте на вопрос: <br /><br /> Данный граф является планарным ?<br /></span>
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
            </div>
            );
    }

    private checkAnswer(value: ChangeEvent<HTMLInputElement>) {
        this.studentAnswer = value.target.value === '0';
        super.forceUpdate();
    }
}

export default App;
