import { createHash } from 'node:crypto';
export const STATUS = new Set(['available','zero-reported','missing','suppressed','not-applicable','invalid-source-value','denominator-zero','calculation-failed']);
export const STATE_FIPS = { AL:'01',AK:'02',AZ:'04',AR:'05',CA:'06',CO:'08',CT:'09',DE:'10',DC:'11',FL:'12',GA:'13',HI:'15',ID:'16',IL:'17',IN:'18',IA:'19',KS:'20',KY:'21',LA:'22',ME:'23',MD:'24',MA:'25',MI:'26',MN:'27',MS:'28',MO:'29',MT:'30',NE:'31',NV:'32',NH:'33',NJ:'34',NM:'35',NY:'36',NC:'37',ND:'38',OH:'39',OK:'40',OR:'41',PA:'42',RI:'44',SC:'45',SD:'46',TN:'47',TX:'48',UT:'49',VT:'50',VA:'51',WA:'53',WV:'54',WI:'55',WY:'56',PR:'72' };
export const FIPS_STATE = Object.fromEntries(Object.entries(STATE_FIPS).map(([a,b])=>[b,a]));
export const EXPECTED_STATES = Object.keys(STATE_FIPS).sort();
export function parseAcsValue(raw,{kind='count'}={}){ if(raw===null||raw===undefined||raw==='') return {value:null,status:'missing'}; const s=String(raw).trim(); if(['**','***','-','(X)','N','null'].includes(s)) return {value:null,status:s==='(X)'?'not-applicable':'suppressed'}; const n=Number(s); if(!Number.isFinite(n)) return {value:null,status:'invalid-source-value'}; if(n<0) return {value:null,status:'suppressed',sourceSentinel:n}; if(kind==='percent'&&(n<0||n>100)) return {value:null,status:'invalid-source-value'}; return {value:n,status:n===0?'zero-reported':'available'}; }
export function combineMoe(moes){ const vals=moes.filter(v=>typeof v==='number'); if(vals.length!==moes.length) return null; return Math.sqrt(vals.reduce((a,b)=>a+b*b,0)); }
export function sha256(txt){ return createHash('sha256').update(txt).digest('hex'); }
export function safeJson(obj){ return JSON.stringify(obj,null,2)+'\n'; }
