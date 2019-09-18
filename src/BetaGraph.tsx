import { IEdgeView, IVertexView } from 'graphlabs.core.template/build/models/graph';
import { Cycle } from './Cycle';
import { Graph, Vertex, Edge } from 'graphlabs.core.graphs';
import { Segment } from './Segment';
import { store } from 'graphlabs.core.template';
import { findDOMNode } from 'react-dom';
 
export class BetaGraph {

    public vertices: IVertexView[] = [];
    public edges: IEdgeView[] = [];
    
    private usedVertices: IVertexView[] = [];
    private usedEdges: IEdgeView[] = [];
    private faces: Cycle[] = [];
    private segments: Segment[] = [];

    public private_log_betagraph_6h: string = "";

    constructor( vertices: IVertexView[], edges: IEdgeView[]){
        this.vertices = vertices.slice();
        this.edges = edges.slice();

        if (!this.vertices || !this.edges){ 
            return null; 
        }

        this.optimizeGraph();
    }

    public findWay(startPoint: IVertexView, finishPoint: IVertexView[], graphEdges?: IEdgeView[], blockedWay?: Segment): Segment{

        if (!graphEdges){
            graphEdges = this.edges;
        }
    
        var resultSegment: Segment = new Segment([], [startPoint], startPoint, null);
        let blackList: IEdgeView[] = [];

        let nameOfBlockedVertex: string = null;
    
        do {
            let nameOfLastVertex = resultSegment.bodyVertices[resultSegment.bodyVertices.length - 1].name;
            
            if (blockedWay){
                nameOfBlockedVertex = blockedWay.bodyVertices[blockedWay.bodyVertices.findIndex(v => v.name == nameOfLastVertex) + 1].name;
            }

            let nextEdge = graphEdges.find( edge => !resultSegment.bodyEdges.find(e => e == edge) 
                                                 && !blackList.find(e => e == edge)
                                                 && (edge.vertexOne == nameOfLastVertex && edge.vertexTwo != nameOfBlockedVertex
                                                  || edge.vertexTwo == nameOfLastVertex && edge.vertexOne != nameOfBlockedVertex));
            
            if (nextEdge == null){
                if (resultSegment.bodyEdges.length == 0){
                    return null;
                }
                blackList.push(resultSegment.bodyEdges.pop());
                resultSegment.bodyVertices.pop();
                continue;
            }
    
            resultSegment.bodyEdges.push(nextEdge);
            
            if (nextEdge.vertexOne == nameOfLastVertex){
                resultSegment.bodyVertices.push(this.vertices.find(v => v.name == nextEdge.vertexTwo));
                resultSegment.contactPointTwo = this.vertices.find(v => v.name == nextEdge.vertexTwo);
            } else {
                resultSegment.bodyVertices.push(this.vertices.find(v => v.name == nextEdge.vertexOne));
                resultSegment.contactPointTwo = this.vertices.find(v => v.name == nextEdge.vertexOne);
            }
    
        } while (!finishPoint.find(v => resultSegment.contactPointTwo.name == v.name))
        
        return resultSegment
    }

    public splitGraphByBridge(): BetaGraph[]{

        if (this.vertices.length < 6){
            return [this];
        }

        let blockedVertices: IVertexView[] = [];

        this.vertices.slice(1).forEach( vertex => {
            let firstWay = this.findWay(this.vertices[0], [vertex]);
            if (!this.findWay(this.vertices[0], [vertex], null, firstWay)){
                blockedVertices.push(vertex);
            }
        });

        if (blockedVertices.length == 0){
            return [this];
        }

        var newGraph1: BetaGraph = new BetaGraph(this.vertices.filter(v1 => !blockedVertices.find(v2 => v1 == v2)), 
                                                 this.edges.filter(e => !blockedVertices.find(v2 => e.vertexOne == v2.name) 
                                                                     && !blockedVertices.find(v2 => e.vertexTwo == v2.name)));

        var newGraph2: BetaGraph = new BetaGraph(blockedVertices, 
                                                 this.edges.filter(e => blockedVertices.find(v2 => e.vertexOne == v2.name) 
                                                                     && blockedVertices.find(v2 => e.vertexTwo == v2.name)));
        
        return [newGraph1].concat(newGraph2.splitGraphByBridge());
    }

    public checkPlanarity(): boolean {

        let splitedGraph = this.splitGraphByBridge()
        if (splitedGraph.length > 1){
            let result: boolean = true;
            splitedGraph.forEach( g => result = result && g.checkPlanarity())
            this.private_log_betagraph_6h += " splite_result: " + result;
            return result;
        }

        var zeroCycle = this.findCycle();
        if(zeroCycle == null){
            this.private_log_betagraph_6h += " zero_cycle_is_null_result: " + true;
            return true;
        }
        if(zeroCycle.vertices.length === 0){
            this.private_log_betagraph_6h += " zero_cycle_is_empty_result: " + true;
            return true;
        }
    
        this.faces = [zeroCycle, new Cycle("G1", zeroCycle.vertices, zeroCycle.edges)];
        this.usedEdges = zeroCycle.edges;
        this.usedVertices = zeroCycle.vertices;
        
        this.findSegments();

        let counter = 0;
        
        while (this.segments.length !== 0 && !this.segments.find(s => s.value === 0) && counter < 100){
            counter++;
            this.segments.sort(function(a, b) { return b.value - a.value; });
    
            let minValueSegment = this.segments.pop();
            let cutFace = this.faces.splice(this.faces.findIndex( f => f.vertices.find(v => v.name == minValueSegment.contactPointOne.name) != null 
                                                                    && f.vertices.find(v => v.name == minValueSegment.contactPointTwo.name) != null), 1)[0];
            let contactPointOneIndex = cutFace.vertices.findIndex(v => v.name == minValueSegment.contactPointOne.name);
            let contactPointTwoIndex = cutFace.vertices.findIndex(v => v.name == minValueSegment.contactPointTwo.name);
    
            this.usedVertices = this.usedVertices.concat(minValueSegment.bodyVertices.slice(1, minValueSegment.bodyVertices.length - 1));
            this.usedEdges = this.usedEdges.concat(minValueSegment.bodyEdges.slice());
    
            let tempVerticesForFirstFace : IVertexView[];
            let tempVerticesForSecondFace : IVertexView[];
            let tempEdgesForFirstFace : IEdgeView[];
            let tempEdgesForSecondFace : IEdgeView[];
    
            if (contactPointOneIndex < contactPointTwoIndex){
                tempVerticesForFirstFace = cutFace.vertices.slice(0, contactPointOneIndex);
                tempVerticesForFirstFace = tempVerticesForFirstFace.concat(minValueSegment.bodyVertices.slice());
                tempVerticesForFirstFace = tempVerticesForFirstFace.concat(cutFace.vertices.slice(contactPointTwoIndex + 1));
    
                tempEdgesForFirstFace = cutFace.edges.slice(0, contactPointOneIndex);
                tempEdgesForFirstFace = tempEdgesForFirstFace.concat(minValueSegment.bodyEdges.slice());
                tempEdgesForFirstFace = tempEdgesForFirstFace.concat(cutFace.edges.slice(contactPointTwoIndex));
    
                tempVerticesForSecondFace = minValueSegment.bodyVertices.slice();
                tempVerticesForSecondFace = tempVerticesForSecondFace.concat(cutFace.vertices.slice(contactPointOneIndex, contactPointTwoIndex).reverse());
    
                tempEdgesForSecondFace = minValueSegment.bodyEdges.slice();
                tempEdgesForSecondFace = tempEdgesForSecondFace.concat(cutFace.edges.slice(contactPointOneIndex, contactPointTwoIndex).reverse());
    
            } else if (contactPointOneIndex > contactPointTwoIndex){
                tempVerticesForFirstFace = cutFace.vertices.slice(0, contactPointTwoIndex);
                tempVerticesForFirstFace = tempVerticesForFirstFace.concat(minValueSegment.bodyVertices.slice().reverse());
                tempVerticesForFirstFace = tempVerticesForFirstFace.concat(cutFace.vertices.slice(contactPointOneIndex + 1));
    
                tempEdgesForFirstFace = cutFace.edges.slice(0, contactPointTwoIndex);
                tempEdgesForFirstFace = tempEdgesForFirstFace.concat(minValueSegment.bodyEdges.slice().reverse());
                tempEdgesForFirstFace = tempEdgesForFirstFace.concat(cutFace.edges.slice(contactPointOneIndex));
    
                tempVerticesForSecondFace = minValueSegment.bodyVertices.slice().reverse();
                tempVerticesForSecondFace = tempVerticesForSecondFace.concat(cutFace.vertices.slice(contactPointTwoIndex, contactPointOneIndex).reverse());
    
                tempEdgesForSecondFace = minValueSegment.bodyEdges.slice().reverse();
                tempEdgesForSecondFace = tempEdgesForSecondFace.concat(cutFace.edges.slice(contactPointTwoIndex, contactPointOneIndex).reverse());
    
            } else if (contactPointOneIndex == contactPointTwoIndex){
                tempVerticesForFirstFace = cutFace.vertices.slice();
                tempEdgesForFirstFace = cutFace.edges.slice();
                tempVerticesForSecondFace = minValueSegment.bodyVertices.slice();
                tempEdgesForSecondFace = minValueSegment.bodyEdges.slice();
            }
    
            this.faces.push(new Cycle(cutFace.name + "0", tempVerticesForFirstFace.slice(), tempEdgesForFirstFace.slice()), new Cycle(cutFace.name + "1", tempVerticesForSecondFace.slice(), tempEdgesForSecondFace.slice()));
            this.findSegments();
        }
    
        if (this.segments.length === 0){
            this.private_log_betagraph_6h += " segments_is_empty_result: " + true;
            return true;
        } else if (this.segments.find(s => s.value === 0)){
            this.private_log_betagraph_6h += " segments_NOT_empty_result: " + false;
            return false;
        }

        this.private_log_betagraph_6h += " I_DONT_KNOW_result: " + null;
        return null;
    }

    public toString(){
        let str: string = "Vertices" + this.vertices.length + ": ";
        this.vertices.forEach(v => str += v.name);
        str += "Edges" + this.edges.length + ": ";
        this.edges.forEach(e => str += e.vertexOne + e.vertexTwo + " ");
        return str;
    }

    private optimizeGraph() {

        this.vertices = this.vertices.filter((v: IVertexView) => this.edges.find((e: IEdgeView) => e.vertexOne == v.name || e.vertexTwo == v.name ));
    
        let numVerticesDeleted: number = 0;
        let verticesMig; 
        
        do{
            verticesMig = this.vertices.filter((v: IVertexView) => this.edges.filter((e: IEdgeView) => e.vertexOne  === v.name || e.vertexTwo  === v.name).length >= 2 );
            numVerticesDeleted = this.vertices.length - verticesMig.length;
            this.vertices = verticesMig;
            
            this.edges = this.edges.filter((e: IEdgeView) => this.vertices.find((v: IVertexView) => v.name === e.vertexOne ) && this.vertices.find((v: IVertexView) => v.name === e.vertexTwo ));
            
        } while(numVerticesDeleted !== 0);

        return true;
    } 

    private findCycle(): Cycle {

        if(this.vertices.length === 0){
            return null;
        }
    
        var resultCycle:Cycle = new Cycle("G0", [this.vertices[0]], null);
    
        let colored:IVertexView[] = [];
    
        let nextEdge = this.edges.find((e: IEdgeView) => e.vertexOne === resultCycle.vertices[0].name || e.vertexTwo === resultCycle.vertices[0].name);
        
        if (nextEdge!=null){
            resultCycle.edges = [nextEdge];
    
            if (nextEdge.vertexOne === resultCycle.vertices[0].name){
                resultCycle.vertices = resultCycle.vertices.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
                colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
            } else 
            {
                resultCycle.vertices = resultCycle.vertices.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
                colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
            }
        }
    
        while (resultCycle.vertices[0] !== resultCycle.vertices[resultCycle.vertices.length - 1]){

            nextEdge = this.edges.find((e: IEdgeView) => (e.vertexOne === resultCycle.vertices[resultCycle.vertices.length - 1].name 
                                                            && e.vertexTwo !== resultCycle.vertices[resultCycle.vertices.length - 2].name 
                                                            && (colored.find((cv: IVertexView) => cv.name === e.vertexTwo) == null))
                                                      || (e.vertexTwo === resultCycle.vertices[resultCycle.vertices.length - 1].name 
                                                            && e.vertexOne !== resultCycle.vertices[resultCycle.vertices.length - 2].name 
                                                            && (colored.find((cv: IVertexView) => cv.name === e.vertexOne) == null)));

            if (nextEdge!=null){
                resultCycle.edges = resultCycle.edges.concat([nextEdge]);
    
                if (nextEdge.vertexOne === resultCycle.vertices[resultCycle.vertices.length - 1].name){
                    resultCycle.vertices = resultCycle.vertices.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
                    colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexTwo)]);
                } else 
                {
                    resultCycle.vertices = resultCycle.vertices.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
                    colored = colored.concat([this.vertices.find((v: IVertexView) => v.name === nextEdge.vertexOne)]);
                }
            }
        }
    
        return resultCycle;
    }

    private findSegments() {

        this.segments.length = 0;

        //Search segments.
        this.edges.filter(nonUsedEdge => !this.usedEdges.find(e => e == nonUsedEdge)).forEach(nonUsedEdge => {
            if (this.usedVertices.find(v => nonUsedEdge.vertexOne == v.name) && this.usedVertices.find(v => nonUsedEdge.vertexTwo == v.name)){
                this.segments.push(new Segment([nonUsedEdge], 
                                                [this.vertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                                 this.vertices.find(v => v.name == nonUsedEdge.vertexTwo)], 
                                                this.vertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                                this.vertices.find(v => v.name == nonUsedEdge.vertexTwo)));
            
            } else if (this.usedVertices.find(v => nonUsedEdge.vertexOne == v.name)){
                this.segments.push(this.findWay(this.vertices.find(v => v.name == nonUsedEdge.vertexOne), 
                                                 this.usedVertices, 
                                                 this.edges.filter(edge => !this.usedEdges.find(e => e == edge))));
            
            } else if (this.usedVertices.find(v => nonUsedEdge.vertexTwo == v.name)){
                this.segments.push(this.findWay(this.vertices.find(v => v.name == nonUsedEdge.vertexTwo), 
                                                 this.usedVertices, 
                                                 this.edges.filter(edge => !this.usedEdges.find(e => e == edge))));
            }
        });
    
        //Calculate value of each found segment
        this.segments.forEach(s => s.value = this.faces.filter( f=> f.vertices.find(v => v.name == s.contactPointOne.name) 
                                                                  && f.vertices.find(v => v.name == s.contactPointTwo.name)).length);

    }

}