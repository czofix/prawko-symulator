import { localVertex, project, type Vertex } from './projection';
export function CyclistModel({angle}:{angle:number}) {
 const p=(v:Vertex)=>{const q=project(...localVertex(v,angle)),o=project(0,0);return [q.x-o.x,q.y-o.y];};
 const line=(vs:Vertex[])=>vs.map(v=>p(v).join(',')).join(' ');
 return <g aria-hidden="true">
 <ellipse cx="8" cy="4" rx="22" ry="9" fill="#26392f" opacity=".25"/>
 {[-17,17].map(y=><polygon key={y} points={line(Array.from({length:24},(_,i)=>[0,y+12*Math.cos(i*Math.PI/12),12+12*Math.sin(i*Math.PI/12)]))} fill="none" stroke="#273642" strokeWidth="3"/>)}
 <polyline points={line([[0,-17,12],[0,-5,27],[0,17,12],[0,2,12],[0,-5,27]])} stroke="#efb956" strokeWidth="3" fill="none"/>
 <polyline points={line([[0,17,12],[0,8,28],[0,-4,32],[0,-8,40],[0,-2,47]])} stroke="#376181" strokeWidth="7" fill="none"/>
 <polyline points={line([[0,-8,40],[-6,-16,29],[6,-16,29]])} stroke="#e6b992" strokeWidth="3" fill="none"/>
 <polyline points={line([[0,8,28],[-7,5,17],[0,2,10]])} stroke="#253c4b" strokeWidth="4" fill="none"/>
 <circle cx={p([0,-2,49])[0]} cy={p([0,-2,49])[1]} r="6" fill="#f2dc8d" stroke="#fff0b6"/>
 </g>;
}
