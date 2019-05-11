import * as React from 'react';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';

export class Cycle {

    name: string;
    vertices: IVertexView[];
    edges: IEdgeView[];

    constructor(name: string, vertices: IVertexView[], edges: IEdgeView[]) {
 
        this.name = name;
        this.vertices = vertices;
        this.edges = edges;
    }

    toString(): string{
        let str:string = "";   
        this.vertices.forEach((element: IVertexView) => { 
            str += element.name;             
        });
        return this.name + " : " + str;
    }
}