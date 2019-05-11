import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Cycle } from './Cycle';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { Segment } from './Segment';
import { store } from 'graphlabs.core.template';
 
export class BetaGraph {

    vertices: Vertex[];
    edges: IEdgeView[];
    used_vertices: IVertexView[];
    used_edges: IEdgeView[];
    faces: Cycle[];
    planarity: Boolean = null;
    segments: Segment[] = [];

/*     constructor(){
        this.vertices = Object.assign({}, store.getState().graph.vertices);
        this.edges = Object.assign({}, store.getState().graph.edges);
        this.OptimizeGraph()
    }

    OptimizeGraph(){

        this.vertices = this.vertices.filter((v: Vertex) => this.edges.find((e: IEdgeView) => e.vertexOne == v.name || e.vertexTwo == v.name ) );
    
        let num_vertices_deleted: number = 0;
        let vertices_mig; 
        
        do{
            vertices_mig = this.vertices.filter((v: Vertex) => this.edges.filter((e: IEdgeView) => e.vertexOne  === v.name || e.vertexTwo  === v.name).length >= 2 );
            num_vertices_deleted = this.vertices.length - vertices_mig.length;
            this.vertices = vertices_mig;
            
            this.edges = this.edges.filter((e: IEdgeView) => this.vertices.find((v: Vertex) => v.name === e.vertexOne ) && this.vertices.find((v: Vertex) => v.name === e.vertexTwo ));
            
        } while(num_vertices_deleted != 0)
    } 
  */   
    findCycle() : Cycle {

        if(this.vertices.length === 0){
            return null;
        }

        var result_cycles:Cycle = new Cycle("G0", [this.vertices[0]], null);

        let colored:IVertexView[] = [];

        let c_edge = this.edges.find((e: IEdgeView) => e.vertexOne === result_cycles.vertices[0].name || e.vertexTwo === result_cycles.vertices[0].name);
        
        if (c_edge!=null){
            result_cycles.edges = [c_edge];

            if (c_edge.vertexOne === result_cycles.vertices[0].name){
                result_cycles.vertices = result_cycles.vertices.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
                colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
            } else 
            {
                result_cycles.vertices = result_cycles.vertices.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
                colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
            }
        }

        while (result_cycles.vertices[0] !== result_cycles.vertices[result_cycles.vertices.length - 1]){    
            c_edge = this.edges.find((e: IEdgeView) => e.vertexOne === result_cycles.vertices[result_cycles.vertices.length - 1].name && e.vertexTwo !== result_cycles.vertices[result_cycles.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexTwo) == null)
                                                    || e.vertexTwo === result_cycles.vertices[result_cycles.vertices.length - 1].name && e.vertexOne !== result_cycles.vertices[result_cycles.vertices.length - 2].name && (colored.find((cv: IVertexView) => cv.name === e.vertexOne) == null));
            if (c_edge!=null){
                result_cycles.edges = result_cycles.edges.concat([c_edge]);

                if (c_edge.vertexOne === result_cycles.vertices[result_cycles.vertices.length - 1].name){
                    result_cycles.vertices = result_cycles.vertices.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
                    colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexTwo)]);
                } else 
                {
                    result_cycles.vertices = result_cycles.vertices.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
                    colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === c_edge.vertexOne)]);
                }
            }
        }

        return result_cycles;
    }

    StartFaces(zero_cycle: Cycle) {
 
        if (zero_cycle == null){
            zero_cycle = this.findCycle();
        }

        if(zero_cycle == null || zero_cycle.vertices.length === 0){
            this.used_vertices = null;
            this.used_edges = null;
            this.faces = null;
            this.planarity = true;

            return;
        }
        
        this.faces = [zero_cycle, new Cycle("G1", zero_cycle.vertices, zero_cycle.edges)];
        this.used_edges = zero_cycle.edges;
        this.used_vertices = zero_cycle.vertices;
    }

    find_segments() : string{
        var private_log_6549H : string = "";

        private_log_6549H += "___I start find segments_________";

        return private_log_6549H;
    }

    toString(): string{
        let str:string = "";   
        this.faces.forEach((element: Cycle) => { 
            str += element.toString() + "__";             
        });
        return str;
    }
}