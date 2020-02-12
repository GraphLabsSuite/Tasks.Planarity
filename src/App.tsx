import * as React from 'react';
import { BetaGraph } from './BetaGraph';
import { graphModel, Template, Toolbar, ToolButtonList, IEdgeView, IVertexView } from 'graphlabs.core.template';
import { IGraph, IVertex, IEdge, Vertex, Graph, Edge } from "graphlabs.core.graphs";
import { ChangeEvent, SyntheticEvent } from "react";
import { IVertexVisualizer } from 'graphlabs.core.visualizer';

var private_log_h2G4: string = "start; ";

function addK5Edges(){

    graphModel.vertices.forEach((v: any) => {
        graphModel.removeVertex(v);
    });

    graphModel.edges.forEach((e: any) => {
        graphModel.removeEdge(e);
    });

    graphModel.vertices.forEach((v: any) => {
        graphModel.removeVertex(v);
    });

    graphModel.edges.forEach((e: any) => {
        graphModel.removeEdge(e);
    });

    graphModel.vertices.forEach((v: any) => {
        graphModel.removeVertex(v);
    });

    graphModel.edges.forEach((e: any) => {
        graphModel.removeEdge(e);
    });

    for (var name in ["0", "1", "2", "3", "4"]){
        graphModel.addVertex(new Vertex(name));
    }

    graphModel.vertices.forEach((v1: any) => {
        graphModel.vertices.forEach((v2: any) => {
            graphModel.addEdge(new Edge(v1, v2)); //(graphModel.getVertex(v1.name)[0], graphModel.getVertex(v2.name)[0])
        })
    });
}

function addBridge(){

    graphModel.vertices.forEach((v: any) => {
        graphModel.removeVertex(v);
    });

    graphModel.edges.forEach((e: any) => {
        graphModel.removeEdge(e);
    });

    graphModel.vertices.forEach((v: any) => {
        graphModel.removeVertex(v);
    });

    graphModel.edges.forEach((e: any) => {
        graphModel.removeEdge(e);
    });

    graphModel.vertices.forEach((v: any) => {
        graphModel.removeVertex(v);
    });

    graphModel.edges.forEach((e: any) => {
        graphModel.removeEdge(e);
    });

    for (var name in ["0", "1", "2", "3", "4", "5"]){
        graphModel.addVertex(new Vertex(name));
    }

    graphModel.addEdge(new Edge(graphModel.getVertex("0")[0], graphModel.getVertex("1")[0]));
    graphModel.addEdge(new Edge(graphModel.getVertex("1")[0], graphModel.getVertex("2")[0]));
    graphModel.addEdge(new Edge(graphModel.getVertex("2")[0], graphModel.getVertex("0")[0]));

    graphModel.addEdge(new Edge(graphModel.getVertex("2")[0], graphModel.getVertex("3")[0]));

    graphModel.addEdge(new Edge(graphModel.getVertex("3")[0], graphModel.getVertex("4")[0]));
    graphModel.addEdge(new Edge(graphModel.getVertex("4")[0], graphModel.getVertex("5")[0]));
    graphModel.addEdge(new Edge(graphModel.getVertex("5")[0], graphModel.getVertex("3")[0]));

}

function graphСheck(){
    //const graph = store.getState().graph;
        
    /** Сheck graph state for defects. */

    //Duplicates

    graphModel.vertices.forEach((element: any, index: number) => {
        if (graphModel.vertices.filter((v: any) => v.name == element.name).length > 1){
            graphModel.removeVertex(element); //vertices.splice(index, 1);
        }
    });
    
    // + 2 edges from same vertices
    graphModel.edges.forEach((element: any, index: number) => {
        if (graphModel.edges.filter((e: any) => e.vertexOne == element.vertexOne && e.vertexTwo == element.vertexTwo
                                                || e.vertexOne == element.vertexTwo && e.vertexTwo == element.vertexOne).length > 1){
            graphModel.removeEdge(element); //edges.splice(index, 1);
        }
    });

    //Edges to nonexistent vertex
    graphModel.edges.forEach((element: any, index: number) => {
        if (!graphModel.vertices.find((v: any) => v.name == element.vertexOne || v.name == element.vertexTwo)){
            graphModel.removeEdge(element); //edges.splice(index, 1);
        }
    });

    //Zero value edges
    graphModel.edges.forEach((element: any, index: number) => {
        if (element.vertexOne == element.vertexTwo){
            graphModel.removeEdge(element); //edges.splice(index, 1);
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
        graphModel.vertices.forEach((v: any) => {
            private_log_h2G4 += v.name;
        });
        private_log_h2G4 += " g1.edges: ";
        graphModel.edges.forEach((e: any) => {
            private_log_h2G4 += "-" + e.vertexOne.name + e.vertexTwo.name + "-";
        });

        var betaGraph = new BetaGraph(graphModel.vertices, graphModel.edges);
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
        graphModel.vertices.forEach((v: any) => {
            private_log_h2G4 += v.name;
        });
        private_log_h2G4 += " g0.edges: ";
        graphModel.edges.forEach((e: any) => {
            private_log_h2G4 += "-" + e.vertexOne.name + e.vertexTwo.name + "-";
        });

        this.componentDidMount();
        private_log_h2G4 += " actual_planarity_result: " + this.planarityResult.toString();

        var graphModelVertices = graphModel.vertices.toString();
        var graphModelEdges = graphModel.edges.toString();

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
