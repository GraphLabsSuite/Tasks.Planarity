import * as React from 'react';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';

export class Cycle {

    name: string;
    vertices: IVertexView[]; 

    constructor(name: string, vertices: IVertexView[]) {
 
        this.name = name;
        this.vertices = vertices;
    }

    toString(): string{
        let str:string = "";   
        this.vertices.forEach((element: IVertexView) => { 
            str += element.name;             
        });
        return this.name + " : " + str;
    }
}