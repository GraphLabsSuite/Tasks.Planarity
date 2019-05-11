import * as React from 'react';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';

export class Segment {

    body_edges: IEdgeView[];
    body_vertices: IVertexView[];
    value: number;
    contactPointOne: IVertexView;
    contactPointTwo: IVertexView;

    constructor(body_edges: IEdgeView[], body_vertices : IVertexView[], contactPointOne: IVertexView, contactPointTwo: IVertexView) {
 
        this.body_edges = body_edges;
        this.body_vertices = body_vertices;
        this.contactPointOne = contactPointOne;
        this.contactPointTwo = contactPointTwo;
    }

    toString(): string{
        var str = "segment(" + this.body_vertices.length + ")(" + this.value + "): ";
        this.body_vertices.forEach( n => str += n.name )
        return str;
    }
}