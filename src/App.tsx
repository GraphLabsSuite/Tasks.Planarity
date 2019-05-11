import * as React from 'react';
import { BetaGraph } from './BetaGraph';
import { store, TaskTemplate, TaskToolbar, ToolButtonList } from 'graphlabs.core.template';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { Cycle } from './Cycle';
import { element, number } from 'prop-types';
import { Segment } from './Segment';
import { IVertexVisualizer } from 'graphlabs.core.visualizer';

var private_log_6549H: string = "";

enum Color {
    White = 0,
    Grey = 1,
    Black = 2
}

function graph_optimize(){
    let beta_graph = Object.assign({}, store.getState().graph);

    
    beta_graph.vertices = beta_graph.vertices.filter((v: Vertex) => beta_graph.edges.find((e: IEdgeView) => e.vertexOne === v.name || e.vertexTwo === v.name ));
    
    let num_vertices_deleted: number = 0;
    let vertices_mig; 
    
    do{
        vertices_mig = beta_graph.vertices.filter((v: Vertex) => beta_graph.edges.filter((e: IEdgeView) => e.vertexOne === v.name || e.vertexTwo === v.name).length >= 2 );
        num_vertices_deleted = beta_graph.vertices.length - vertices_mig.length;
        beta_graph.vertices = vertices_mig;
        
        beta_graph.edges = beta_graph.edges.filter((e: IEdgeView) => beta_graph.vertices.find((v: Vertex) => v.name === e.vertexOne) && beta_graph.vertices.find((v: Vertex) => v.name === e.vertexTwo));
        
    } while(num_vertices_deleted != 0)

    return beta_graph;
}

function find_way(graph_vertices: IVertexView[], graph_edges: IEdgeView[], start_point: IVertexView, finish_point: IVertexView[]) : Segment{
    
    var resultSegment :  Segment = new Segment([], [start_point], start_point, null);
    var blackList : IEdgeView[] = [];

    do {
        var nextEdge = graph_edges.find( edge => !resultSegment.body_edges.find(e => e == edge) && !blackList.find(e => e == edge)
            && (edge.vertexOne == resultSegment.body_vertices[resultSegment.body_vertices.length - 1].name
                || edge.vertexTwo == resultSegment.body_vertices[resultSegment.body_vertices.length - 1].name));
        
        if (nextEdge == null){
            if (resultSegment.body_edges.length == 0){
                return null;
            }
            blackList.push(resultSegment.body_edges.pop());
            resultSegment.body_vertices.pop();
            continue;
        }

        resultSegment.body_edges.push(nextEdge);
        
        if (nextEdge.vertexOne == resultSegment.body_vertices[resultSegment.body_vertices.length - 1].name){
            resultSegment.body_vertices.push(graph_vertices.find(v => v.name == nextEdge.vertexTwo));
            resultSegment.contactPointTwo = graph_vertices.find(v => v.name ==nextEdge.vertexTwo);
        } else {
            resultSegment.body_vertices.push(graph_vertices.find(v => v.name == nextEdge.vertexOne));
            resultSegment.contactPointTwo = graph_vertices.find(v => v.name == nextEdge.vertexOne);
        }

    } while (!finish_point.find(v => resultSegment.contactPointTwo.name == v.name))
    
    return resultSegment
}

/* function dfs(vertex: IVertexView, c_graph_vertices: IVertexView[], c_graph_edges: IEdgeView[], colored: Color[]) {
    colored[Number(vertex.name)] = Color.Grey;

    c_graph_edges.filter((element: IEdgeView) => (element.vertexOne == vertex.name && colored[Number(element.vertexOne)] != Color.Black)
                                              || (element.vertexTwo == vertex.name && colored[Number(element.vertexTwo)] != Color.Black))
                                              .forEach((element: IEdgeView) => {
       if (element.vertexOne == vertex.name){
            if (colored[Number(element.vertexTwo)] == Color.White){
                dfs(c_graph_vertices.find((v: IVertexView) => v.name == element.vertexTwo), c_graph_vertices, c_graph_edges, colored); 
            }
            else if(colored[Number(element.vertexTwo)] == Color.Grey){
                private_log_6549H += "___" + "I find the cycle" + colored + "___";
            }
       }
       else if(element.vertexTwo == vertex.name){
            if (colored[Number(element.vertexOne)] == Color.White){
                dfs(c_graph_vertices.find((v: IVertexView) => v.name == element.vertexOne), c_graph_vertices, c_graph_edges, colored); 
            }
            else if(colored[Number(element.vertexOne)] == Color.Grey){
                private_log_6549H += "___" + "I find the cycle" + colored + "___";
            }
       }
       colored[Number(vertex.name)] = Color.Black;
    });

    return colored;
}


function find_cycle_dfs(c_graph_vertices: IVertexView[], c_graph_edges: IEdgeView[]) {
    
    //if(c_graph_vertices.length === 0){
    //    return null;
    //}

    let result_cycle:Cycle[] = [];

    const graph = store.getState().graph;
    let colored = new Array<Color>(graph.vertices.length).fill(Color.White);

    private_log_6549H += "___" + colored + "___";

    colored = dfs(c_graph_vertices[0], c_graph_vertices, c_graph_edges, colored);

    private_log_6549H += "___" + colored + "___";

    return result_cycle;
} */

function find_cycle(c_graph_vertices: IVertexView[], c_graph_edges: IEdgeView[] ) {

    if(c_graph_vertices.length === 0){
        return null;
    }

    var result_cycles:Cycle = new Cycle("G0", [c_graph_vertices[0]], null);

    let colored:IVertexView[] = [];

    let c_edge = c_graph_edges.find((e: IEdgeView) => e.vertexOne === result_cycles.vertices[0].name || e.vertexTwo === result_cycles.vertices[0].name);
    
    if (c_edge!=null){
        result_cycles.edges = [c_edge];

        if (c_edge.vertexOne === result_cycles.vertices[0].name){
            result_cycles.vertices = result_cycles.vertices.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
            colored = colored.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
        } else 
        {
            result_cycles.vertices = result_cycles.vertices.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
            colored = colored.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
        }
    }

    while (result_cycles.vertices[0] !== result_cycles.vertices[result_cycles.vertices.length - 1]){    
        c_edge = c_graph_edges.find((e: IEdgeView) => e.vertexOne === result_cycles.vertices[result_cycles.vertices.length - 1].name && e.vertexTwo !== result_cycles.vertices[result_cycles.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexTwo) == null)
                                                   || e.vertexTwo === result_cycles.vertices[result_cycles.vertices.length - 1].name && e.vertexOne !== result_cycles.vertices[result_cycles.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexOne) == null));
        if (c_edge!=null){
            result_cycles.edges = result_cycles.edges.concat([c_edge]);

            if (c_edge.vertexOne === result_cycles.vertices[result_cycles.vertices.length - 1].name){
                result_cycles.vertices = result_cycles.vertices.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
                colored = colored.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
            } else 
            {
                result_cycles.vertices = result_cycles.vertices.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
                colored = colored.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
            }
        }
    }

    return result_cycles;
}

function find_segments(faces: Cycle[], graph_vertices: IVertexView[], graph_edges: IEdgeView[], used_edges: IEdgeView[], used_vertices: IVertexView[]): Segment[]{

    var resultSegments: Segment[] = [];

    //Search segments.
    graph_edges.filter(nonUsedEdge => !used_edges.find(e => e == nonUsedEdge)).forEach(nonUsedEdge => {
        if (used_vertices.find(v => nonUsedEdge.vertexOne == v.name) && used_vertices.find(v => nonUsedEdge.vertexTwo == v.name)){
            resultSegments.push(new Segment([nonUsedEdge], 
                                            [graph_vertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                            graph_vertices.find(v => v.name == nonUsedEdge.vertexTwo)], 
                                            graph_vertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                            graph_vertices.find(v => v.name == nonUsedEdge.vertexTwo)));
        
        } else if (used_vertices.find(v => nonUsedEdge.vertexOne == v.name)){
            resultSegments.push(find_way(graph_vertices, graph_edges.filter(edge => !used_edges.find(e => e == edge)), graph_vertices.find(v => v.name == nonUsedEdge.vertexOne), used_vertices));
        
        } else if (used_vertices.find(v => nonUsedEdge.vertexTwo == v.name)){
            resultSegments.push(find_way(graph_vertices, graph_edges.filter(edge => !used_edges.find(e => e == edge)), graph_vertices.find(v => v.name == nonUsedEdge.vertexTwo), used_vertices));
        }
    });

    //Calculate value of each found segment
    resultSegments.forEach(s => s.value = faces.filter( f=> f.vertices.find(v => v.name == s.contactPointOne.name) && f.vertices.find(v => v.name == s.contactPointTwo.name)).length);

    return resultSegments;
}

function planarity(graph_vertices: IVertexView[], graph_edges: IEdgeView[], zero_cycle: Cycle ) : boolean {

    if(zero_cycle == null){
        return true;
    }
    if(zero_cycle.vertices.length === 0){
        return true;
    }

    var faces: Cycle[] = [zero_cycle, new Cycle("G1", zero_cycle.vertices, zero_cycle.edges)];
    var used_edges: IEdgeView[] = zero_cycle.edges;
    var used_vertices: IVertexView[] = zero_cycle.vertices;

    faces.forEach((c: Cycle) => private_log_6549H += c.name + ", ")
    private_log_6549H += "_e0^" + used_edges.length + ":";
    used_edges.forEach((element: IEdgeView) => private_log_6549H += element.vertexOne + element.vertexTwo + ", ");
    private_log_6549H += "___";

    var segments : Segment[] = find_segments(faces, graph_vertices, graph_edges, used_edges, used_vertices);
    segments.forEach(s => private_log_6549H += s.toString() + "_");

    var counter = 0;
    
    while (segments.length != 0 && !segments.find(s => s.value == 0) && counter < 10){
        counter++;
        segments.sort(function(a, b) { return b.value - a.value; });  //segments.find( segment => segment.value == segments.reduce((min, s) => s.value < min ? s.value : min, segments[0].value));

        var minValueSegment = segments.pop();
        var cutFace = faces.splice(faces.findIndex( f => f.vertices.find(v => v.name == minValueSegment.contactPointOne.name) != null && f.vertices.find(v => v.name == minValueSegment.contactPointTwo.name) != null), 1)[0];
        var contactPointOneIndex = cutFace.vertices.findIndex(v => v.name == minValueSegment.contactPointOne.name);
        var contactPointTwoIndex = cutFace.vertices.findIndex(v => v.name == minValueSegment.contactPointTwo.name);

        used_vertices = used_vertices.concat(minValueSegment.body_vertices.slice(1, minValueSegment.body_vertices.length - 1));
        used_edges = used_edges.concat(minValueSegment.body_edges.slice());

        private_log_6549H += "Cutting Face : __ " + cutFace.toString();
        private_log_6549H += "___" + contactPointOneIndex + "^" + contactPointTwoIndex + "---";

        var newVertices1 : IVertexView[];
        var newVertices2 : IVertexView[];
        var newEdges1 : IEdgeView[];
        var newEdges2 : IEdgeView[];

        if (contactPointOneIndex < contactPointTwoIndex){
            newVertices1 = cutFace.vertices.slice(0, contactPointOneIndex);
            newVertices1 = newVertices1.concat(minValueSegment.body_vertices.slice());
            newVertices1 = newVertices1.concat(cutFace.vertices.slice(contactPointTwoIndex + 1));

            newEdges1 = cutFace.edges.slice(0, contactPointOneIndex);
            newEdges1 = newEdges1.concat(minValueSegment.body_edges.slice());
            newEdges1 = newEdges1.concat(cutFace.edges.slice(contactPointTwoIndex));

            newVertices2 = minValueSegment.body_vertices.slice();
            newVertices2 = newVertices2.concat(cutFace.vertices.slice(contactPointOneIndex, contactPointTwoIndex).reverse());

            newEdges2 = minValueSegment.body_edges.slice();
            newEdges2 = newEdges2.concat(cutFace.edges.slice(contactPointOneIndex, contactPointTwoIndex).reverse());

        } else if (contactPointOneIndex > contactPointTwoIndex){
            newVertices1 = cutFace.vertices.slice(0, contactPointTwoIndex);
            newVertices1 = newVertices1.concat(minValueSegment.body_vertices.slice().reverse());
            newVertices1 = newVertices1.concat(cutFace.vertices.slice(contactPointOneIndex + 1));

            newEdges1 = cutFace.edges.slice(0, contactPointTwoIndex);
            newEdges1 = newEdges1.concat(minValueSegment.body_edges.slice().reverse());
            newEdges1 = newEdges1.concat(cutFace.edges.slice(contactPointOneIndex));

            newVertices2 = minValueSegment.body_vertices.slice().reverse();
            newVertices2 = newVertices2.concat(cutFace.vertices.slice(contactPointTwoIndex, contactPointOneIndex).reverse());

            newEdges2 = minValueSegment.body_edges.slice().reverse();
            newEdges2 = newEdges2.concat(cutFace.edges.slice(contactPointTwoIndex, contactPointOneIndex).reverse());

        } else if (contactPointOneIndex == contactPointTwoIndex){
            newVertices1 = cutFace.vertices.slice();
            newEdges1 = cutFace.edges.slice();
            newVertices2 = minValueSegment.body_vertices.slice();
            newEdges2 = minValueSegment.body_edges.slice();
        }

        faces.push(new Cycle(cutFace.name + "0", newVertices1.slice(), newEdges1.slice()), new Cycle(cutFace.name + "1", newVertices2.slice(), newEdges2.slice()));
        segments = find_segments(faces, graph_vertices, graph_edges, used_edges, used_vertices);

        private_log_6549H += "__ ||||___________|||| __ ";

        private_log_6549H += "__ vert cutFace: __ ";
        cutFace.vertices.forEach(v => private_log_6549H += v.name);
        private_log_6549H += "__ edge cutFace: __ ";
        cutFace.edges.forEach(e => private_log_6549H += e.vertexOne + e.vertexTwo + "-");

        private_log_6549H += "__ ||||___________|||| __ ";

        private_log_6549H += "Segment vert: __ ";
        minValueSegment.body_vertices.forEach(v => private_log_6549H += v.name);
        private_log_6549H += "Segment edge: __ ";
        minValueSegment.body_edges.forEach(e => private_log_6549H += e.vertexOne + e.vertexTwo + "-");

        private_log_6549H += "__ ||||___________|||| __ ";

        private_log_6549H += "__ vert newVertices1: __ ";
        newVertices1.forEach(v => private_log_6549H += v.name);
        private_log_6549H += "__ vert newVertices2: __ ";
        newVertices2.forEach(v => private_log_6549H += v.name);
        private_log_6549H += "__ vert edges1 : __ ";
        newEdges1.forEach(e => private_log_6549H += e.vertexOne + e.vertexTwo + "-");
        private_log_6549H += "__ vert edges2 : __ ";
        newEdges2.forEach(e => private_log_6549H += e.vertexOne + e.vertexTwo + "-");
    }

    if (segments.length == 0){
        return true;
    } else if (segments.find(s => s.value == 0)){
        return false;
    }

    return null;
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
        const graph = store.getState().graph;

        var list_of_vertices: string = "";
        graph.vertices.forEach((element: Vertex) => {
            list_of_vertices += element.name;
        })

        var list_of_edges: string = "";
        graph.edges.forEach((element: IEdgeView) => {
            list_of_edges+=element.vertexOne + element.vertexTwo + " , ";
        });

        var beta_graph = graph_optimize();

        var list_of_vertices_beta: string = "";
        beta_graph.vertices.forEach((element: Vertex) => {
            list_of_vertices_beta += element.name;
        })

        var list_of_edges_beta: string = "";
        beta_graph.edges.forEach((element: IEdgeView) => {
            list_of_edges_beta+=element.vertexOne + element.vertexTwo + ", ";
        });

        var res_cycle = find_cycle(beta_graph.vertices, beta_graph.edges);
        var res_cycle_string = res_cycle==null? "Граф Планарен! Цикла нет.": res_cycle.toString();

        //find_cycle_dfs(beta_graph.vertices, beta_graph.edges);

        var planarity_result = planarity(beta_graph.vertices, beta_graph.edges, res_cycle);



        return () => (
            <div>
                <span> В данном графе {graph.vertices.length} вершин.<br />  В данном графе {graph.edges.length} связей. </span>
                <span> <br /> <br /> Точки в данном графе: {list_of_vertices} </span>
                <span> <br /> Связи в данном графе: {list_of_edges} </span>
                <span> <br /> <br /> Точки в графе_beta: {list_of_vertices_beta} </span>
                <span> <br /> Связи в графе_beta: {list_of_edges_beta} </span>
                <span> <br /> <br /> Найденный цикл: {res_cycle_string} </span>
                <span> <br /> <br /> Результат исследования на планарность: {planarity_result.toString()} </span>
                <span> <br /> <br /> Лог: {private_log_6549H} </span>
            </div>
            );
    }   
}

export default App;