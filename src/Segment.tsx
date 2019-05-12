import * as React from 'react';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';

export class Segment {

    bodyEdges: IEdgeView[] = [];
    bodyVertices: IVertexView[] = [];
    value: number = null;
    contactPointOne: IVertexView = null;
    contactPointTwo: IVertexView = null;

    constructor(bodyEdges: IEdgeView[], bodyVertices : IVertexView[], contactPointOne: IVertexView, contactPointTwo: IVertexView) {
 
        this.bodyEdges = bodyEdges;
        this.bodyVertices = bodyVertices;
        this.contactPointOne = contactPointOne;
        this.contactPointTwo = contactPointTwo;
    }

    toString(): string{
        var str = "segment(" + this.bodyVertices.length + ")(" + this.value + "): ";
        this.bodyVertices.forEach( n => str += n.name )
        return str;
    }
}