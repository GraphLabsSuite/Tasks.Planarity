import * as React from 'react';
import { IGraph, IVertex, IEdge, Vertex, Graph, Edge } from "graphlabs.core.graphs";

export class Segment {

    public bodyEdges: IEdge[] = [];
    public bodyVertices: IVertex[] = [];
    public value: number = null;
    public contactPointOne: IVertex = null;
    public contactPointTwo: IVertex = null;

    constructor(bodyEdges: IEdge[], bodyVertices : IVertex[], contactPointOne: IVertex, contactPointTwo: IVertex) {
 
        this.bodyEdges = bodyEdges;
        this.bodyVertices = bodyVertices;
        this.contactPointOne = contactPointOne;
        this.contactPointTwo = contactPointTwo;
    }

    public toString(): string{
        var str = "segment(" + this.bodyVertices.length + ")(" + this.value + "): ";
        this.bodyVertices.forEach( n => str += n.name )
        return str;
    }
}