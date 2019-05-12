import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Cycle } from './Cycle';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { Segment } from './Segment';
import { store } from 'graphlabs.core.template';
 
export class BetaGraph {

    vertices: IVertexView[];
    edges: IEdgeView[];
    usedVertices: IVertexView[];
    usedEdges: IEdgeView[];
    faces: Cycle[];
    planarity: Boolean;
    segments: Segment[];

    constructor( vertices: IVertexView[], edges: IEdgeView[]){
        this.vertices = vertices.slice();
        this.edges = edges.slice();
    }

    OptimizeGraph() {

        if (!this.vertices || !this.edges){ return null; }
        if (this.vertices.length == 0 || this.edges.length == 0){ return false; }
        
        this.vertices = this.vertices.filter((v: IVertexView) => this.edges.find((e: IEdgeView) => e.vertexOne == v.name || e.vertexTwo == v.name ));
    
        let num_vertices_deleted: number = 0;
        let vertices_mig; 
        
        do{
            vertices_mig = this.vertices.filter((v: IVertexView) => this.edges.filter((e: IEdgeView) => e.vertexOne  === v.name || e.vertexTwo  === v.name).length >= 2 );
            num_vertices_deleted = this.vertices.length - vertices_mig.length;
            this.vertices = vertices_mig;
            
            this.edges = this.edges.filter((e: IEdgeView) => this.vertices.find((v: IVertexView) => v.name === e.vertexOne ) && this.vertices.find((v: IVertexView) => v.name === e.vertexTwo ));
            
        } while(num_vertices_deleted != 0);

        return true;
    } 
}