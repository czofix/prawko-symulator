import { routeFor } from '../../domain/routes';
import type { AnimationStep, Approach, LegalSource, Maneuver, Participant, ParticipantId, RoadSign, Scenario, Signal } from '../../domain/types';
export const categories = ['Równorzędne i skręty','Znaki i pierwszeństwo','Łamane pierwszeństwo','Sygnalizacja świetlna','Ruch okrężny','Piesi i rowerzyści','Pasy i włączanie się'] as const;
export const approachName = {south:'dolny',north:'górny',east:'prawy',west:'lewy'};
export const car = (id: ParticipantId, approach: Approach, maneuver: Maneuver = 'straight'): Participant => ({ id, approach, maneuver, kind:'car', description:`${id}: wlot ${approachName[approach]}, ${{straight:'jedzie prosto',left:'skręca w lewo',right:'skręca w prawo'}[maneuver]}`, route:routeFor(approach,maneuver) });
export const sign = (approach: Approach, type: RoadSign['type']): RoadSign => ({approach,type,label:`${{yield:'A-7: ustąp pierwszeństwa',priority:'D-1: droga z pierwszeństwem',stop:'B-20: STOP',roundabout:'C-12: ruch okrężny',bend:'Tabliczka przebiegu pierwszeństwa',crossing:'D-6: przejście dla pieszych',cycleCrossing:'D-6a: przejazd dla rowerzystów'}[type]} — wlot ${approachName[approach]}`});
export function bentSigns(main: Approach[]): RoadSign[] {
 const rotation = main.includes('south') ? (main.includes('west') ? 0 : 270) : (main.includes('west') ? 90 : 180);
 return (['south','north','east','west'] as const).flatMap(a=>[sign(a,main.includes(a)?'priority':'yield'),{...sign(a,'bend'),bendRotation:rotation,label:`${main.includes(a)?'T-6a':'T-6c'}: pierwszeństwo łączy wlot ${approachName[main[0]]} i ${approachName[main[1]]} — tabliczka dla wlotu ${approachName[a]}`}]);
}
export const signal = (approach: Approach, color: Signal['color'], kind: Signal['kind']='S-1', direction?: Signal['direction']): Signal => ({approach,color,kind,direction,label:`${kind}: ${{red:'czerwone',green:'zielone',amber:'żółte','red-amber':'czerwone i żółte'}[color]}${direction ? `, strzałka w ${direction==='left'?'lewo':'prawo'}`:''} — wlot ${approachName[approach]}`});
export const law = (provision:string): LegalSource => ({title:'Prawo o ruchu drogowym, Dz.U. 2024 poz. 1251, z uwzględnieniem późniejszych zmian',provision,url:'https://api.sejm.gov.pl/eli/acts/DU/2024/1251/text.pdf',checkedAt:'2026-10-10'});
export const signsLaw = (provision:string): LegalSource => ({title:'Znaki i sygnały drogowe, Dz.U. 2019 poz. 2310, z uwzględnieniem późniejszych zmian',provision,url:'https://api.sejm.gov.pl/eli/acts/DU/2019/2310/text.pdf',checkedAt:'2026-10-10'});
export const step = (actors:ParticipantId[], text:string, highlight=actors.join(',')): AnimationStep => ({actors,text,highlight,duration:3200});
export const options = (ids:ParticipantId[]) => ids.map(id=>({id,label:`Uczestnik ${id}`,actor:id}));
export const first = (ids:ParticipantId[], correct:ParticipantId): Scenario['question'] => ({kind:'single',prompt:'Kto powinien przejechać jako pierwszy?',options:options(ids),accepted:[[correct]]});
export const order = (ids:ParticipantId[], accepted:ParticipantId[][]): Scenario['question'] => ({kind:'order',prompt:'Ułóż poprawną kolejność pojedynczych przejazdów.',options:options(ids),accepted});
export const choice = (prompt:string, yes:string, no:string): Scenario['question'] => ({kind:'single',prompt,options:[{id:'correct',label:yes},{id:'other',label:no}],accepted:[['correct']]});
export function define(category:0|1|2|3|4|5|6, data: Omit<Scenario,'category'|'verification'|'geometry'|'signs'|'signals'> & Partial<Pick<Scenario,'geometry'|'signs'|'signals'>>):Scenario {
 const s:Scenario={geometry:'crossroad',signs:[],signals:[],...data,category:categories[category],verification:'verified'};
 if(s.question.options.every(o=>!o.actor) && [...s.id].reduce((n,c)=>n+c.charCodeAt(0),0)%2) s.question={...s.question,options:[...s.question.options].reverse()};
 return s;
}
