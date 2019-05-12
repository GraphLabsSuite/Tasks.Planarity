import * as React from 'react';
import { BetaGraph } from './BetaGraph';
import { store, TaskTemplate, TaskToolbar, ToolButtonList } from 'graphlabs.core.template';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Graph, Vertex, Edge, VertexJSON } from 'graphlabs.core.graphs';
import { Cycle } from './Cycle';
import { element, number } from 'prop-types';
import { Segment } from './Segment';

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
    newEdge3.vertexOne = "1";
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

class App extends TaskTemplate {

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
        //addBridge();
        graphСheck();

        var betaGraph = new BetaGraph(store.getState().graph.vertices, store.getState().graph.edges);
        var planarityResult = betaGraph.checkPlanarity().toString();

        var devstring = "";

        /* 
        var listBetaGraph = betaGraph.splitGraphByBridge();

        devstring+=betaGraph;
        devstring+= "____ После разбиенеия _______";
        listBetaGraph.forEach( g => devstring += g.toString());
        */

        if (planarityResult == null){
            devstring += "Пожалуйста сообщите об этом преподавателю или лаборанту. Результат проверки на планарность = null";
        }

        return () => (
            <div>
                <form>
                    <span> Ответьте на вопрос: <br /><br /> Данный граф является планарным ?<br /></span>
                    <div className="radio">
                    <label>
                        <input type="radio" value="true" />
                        Да. Данный граф планарен.
                    </label>
                    </div>
                    <div className="radio">
                    <label>
                        <input type="radio" value="false" />
                        Нет. Данный граф не планарен.
                    </label>
                    </div>
                </form>
                <span> <br /> <br /> {planarityResult} </span>
                <span> <br /> <br /> {devstring} </span>
            </div>
            );
    }   
}

export default App;