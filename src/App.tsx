import * as React from 'react';
import { store, TaskTemplate, TaskToolbar, ToolButtonList } from 'graphlabs.core.template';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { Cycle } from './Cycle';
import { element } from 'prop-types';

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

    var result_cycles:Cycle = new Cycle("G0", [c_graph_vertices[0]]);

    //private_log_6549H += result_cycles.toString() + " v0 = " + c_graph_vertices[0].name + "_";
    
    // var v2_list_of_edges_beta: string = "";
    // c_graph_edges.forEach((element: IEdgeView) => {
    //     v2_list_of_edges_beta+=element.vertexOne + element.vertexTwo + ", ";
    // });
    // private_log_6549H += v2_list_of_edges_beta;

    let colored:IVertexView[] = [];

    let c_edge = c_graph_edges.find((e: IEdgeView) => e.vertexOne === result_cycles.vertices[0].name || e.vertexTwo === result_cycles.vertices[0].name);
    
    if (c_edge!=null){
        //private_log_6549H += "_____________new vertex i take from edge: " + c_edge.vertexOne + c_edge.vertexTwo;
        if (c_edge.vertexOne === result_cycles.vertices[0].name){
            result_cycles.vertices = result_cycles.vertices.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
            colored = colored.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
        } else 
        {
            result_cycles.vertices = result_cycles.vertices.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
            colored = colored.concat([c_graph_vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
        }
    }

    //private_log_6549H += result_cycles.toString() + " v0 = " + c_graph_vertices[0].name + "_";

    while (result_cycles.vertices[0] !== result_cycles.vertices[result_cycles.vertices.length - 1]){    
        c_edge = c_graph_edges.find((e: IEdgeView) => e.vertexOne === result_cycles.vertices[result_cycles.vertices.length - 1].name && e.vertexTwo !== result_cycles.vertices[result_cycles.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexTwo) == null)
                                                   || e.vertexTwo === result_cycles.vertices[result_cycles.vertices.length - 1].name && e.vertexOne !== result_cycles.vertices[result_cycles.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexOne) == null));
        if (c_edge!=null){
            //private_log_6549H += "_____________new vertes i take from edge: " + c_edge.vertexOne + c_edge.vertexTwo + "_____________colored is:";
            //colcored.forEach(( e: IVertexView) => private_log_6549H += e.name);
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

        var res_cycl = find_cycle(beta_graph.vertices, beta_graph.edges);
        var res_cycl_string = res_cycl==null? "Граф Планарен! Цикла нет.": res_cycl.toString();

        //find_cycle_dfs(beta_graph.vertices, beta_graph.edges);

        return () => (
            <div>
                <span> В данном графе {graph.vertices.length} вершин.<br />  В данном графе {graph.edges.length} связей. </span>
                <span> <br /> <br /> Точки в данном графе: {list_of_vertices} </span>
                <span> <br /> Связи в данном графе: {list_of_edges} </span>
                <span> <br /> <br /> Точки в графе_beta: {list_of_vertices_beta} </span>
                <span> <br /> Связи в графе_beta: {list_of_edges_beta} </span>
                <span> <br /> <br /> Найденный цикл: {res_cycl_string} </span>
                <span> <br /> <br /> Лог: {private_log_6549H} </span>
            </div>
            );
    }   
}

export default App;