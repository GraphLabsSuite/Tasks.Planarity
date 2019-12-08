import * as React from 'react';
import { IGraph, IVertex, IEdge, Vertex, Graph, Edge } from "graphlabs.core.graphs";

export class Cycle {

    public name: string = null;
    public vertices: IVertex[] = [];
    public edges: IEdge[] = [];

    constructor(name: string, vertices: IVertex[], edges: IEdge[]) {
 
        this.name = name;
        this.vertices = vertices;
        this.edges = edges;
    }

    public toString(): string{
        let str:string = "";   
        this.vertices.forEach((element: IVertex) => { 
            str += element.name;             
        });
        return this.name + " : " + str;
    }
}