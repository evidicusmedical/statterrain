export const STATE_ADJACENCY: Record<string, string[]> = {
  AL:["FL","GA","MS","TN"], AK:[], AZ:["CA","CO","NM","NV","UT"], AR:["LA","MO","MS","OK","TN","TX"], CA:["AZ","NV","OR"], CO:["AZ","KS","NE","NM","OK","UT","WY"], CT:["MA","NY","RI"], DC:["MD","VA"], DE:["MD","NJ","PA"], FL:["AL","GA"], GA:["AL","FL","NC","SC","TN"], HI:[], IA:["IL","MN","MO","NE","SD","WI"], ID:["MT","NV","OR","UT","WA","WY"], IL:["IA","IN","KY","MO","WI"], IN:["IL","KY","MI","OH"], KS:["CO","MO","NE","OK"], KY:["IL","IN","MO","OH","TN","VA","WV"], LA:["AR","MS","TX"], MA:["CT","NH","NY","RI","VT"], MD:["DC","DE","PA","VA","WV"], ME:["NH"], MI:["IN","OH","WI"], MN:["IA","ND","SD","WI"], MO:["AR","IA","IL","KS","KY","NE","OK","TN"], MS:["AL","AR","LA","TN"], MT:["ID","ND","SD","WY"], NC:["GA","SC","TN","VA"], ND:["MN","MT","SD"], NE:["CO","IA","KS","MO","SD","WY"], NH:["MA","ME","VT"], NJ:["DE","NY","PA"], NM:["AZ","CO","OK","TX","UT"], NV:["AZ","CA","ID","OR","UT"], NY:["CT","MA","NJ","PA","VT"], OH:["IN","KY","MI","PA","WV"], OK:["AR","CO","KS","MO","NM","TX"], OR:["CA","ID","NV","WA"], PA:["DE","MD","NJ","NY","OH","WV"], PR:[], RI:["CT","MA"], SC:["GA","NC"], SD:["IA","MN","MT","ND","NE","WY"], TN:["AL","AR","GA","KY","MO","MS","NC","VA"], TX:["AR","LA","NM","OK"], UT:["AZ","CO","ID","NM","NV","WY"], VA:["DC","KY","MD","NC","TN","WV"], VT:["MA","NH","NY"], WA:["ID","OR"], WI:["IA","IL","MI","MN"], WV:["KY","MD","OH","PA","VA"], WY:["CO","ID","MT","NE","SD","UT"]
};
export interface PartitionSelectionInput { lat:number; lng:number; radiusMiles:number; state?:string | null; label?:string | null; query?:string | null; }
export function inferStateCode(input: PartitionSelectionInput): string | null {
  const explicit = input.state?.toUpperCase(); if (explicit && STATE_ADJACENCY[explicit]) return explicit;
  const text = `${input.label ?? ''} ${input.query ?? ''}`.toUpperCase();
  const m = text.match(/(?:,|\s)(A[LKZR]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|PR|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])(?:\b|,)/);
  if (m && STATE_ADJACENCY[m[1]]) return m[1];
  return null;
}
export function selectCmsHospitalPartitions(input: PartitionSelectionInput): string[] {
  const state = inferStateCode(input);
  if (!state) return ["CA","DC","FL","IL","NY","TX"];
  const set = new Set([state]);
  for (const adj of STATE_ADJACENCY[state] ?? []) set.add(adj);
  if (input.radiusMiles >= 150) for (const adj of [...set]) for (const two of STATE_ADJACENCY[adj] ?? []) set.add(two);
  return [...set].sort();
}
