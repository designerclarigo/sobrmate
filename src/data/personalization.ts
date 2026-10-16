export const recoveryQuestions = [
  {key:'motivation',title:'What makes this change matter to you?',subtitle:'Choose the reason that feels closest today.',multiple:false,options:['Feel healthier','Be present for the people I love','Feel more like myself','Find more calm and focus']},
  {key:'dailyChallenges',title:'When does the day feel hardest?',subtitle:'Choose any that fit. There is no wrong answer.',multiple:true,options:['Busy or stressful days','Quiet evenings','Social situations','Disrupted routines']},
  {key:'triggers',title:'What tends to pull you off course?',subtitle:'Noticing a pattern is a kind place to start.',multiple:true,options:['Stress or difficult feelings','Boredom','Being around the habit','Feeling tired or alone']},
  {key:'recoveryGoal',title:'What would meaningful progress feel like?',subtitle:'Let your own definition guide the next step.',multiple:false,options:['A steadier daily routine','More energy and presence','Confidence in my choices','One mindful day at a time']},
] as const;
export interface RecoveryPersonalization {version:1;motivation:string;dailyChallenges:string[];triggers:string[];recoveryGoal:string}
export const emptyPersonalization=():RecoveryPersonalization=>({version:1,motivation:'',dailyChallenges:[],triggers:[],recoveryGoal:''});
export function validatePersonalization(value:RecoveryPersonalization):void {
  if(!value||value.version!==1)throw new Error('Your recovery preferences could not be read.');
  for(const question of recoveryQuestions){const answer=value[question.key];
    if(question.multiple){if(!Array.isArray(answer)||answer.length>4||new Set(answer).size!==answer.length||answer.some(v=>typeof v!=='string'||!(question.options as readonly string[]).includes(v)))throw new Error('Review your selected recovery preferences.');}
    else if(typeof answer!=='string'||(answer!==''&&!(question.options as readonly string[]).includes(answer)))throw new Error('Review your selected recovery preferences.');
  }
}
export function hasPersonalization(value:RecoveryPersonalization):boolean {return !!(value.motivation||value.recoveryGoal||value.dailyChallenges.length||value.triggers.length);}
export function personalizedSupport(value?:RecoveryPersonalization):string {
  if(!value)return '';
  if(value.dailyChallenges.includes('Quiet evenings'))return 'Give your evening a gentle anchor: a walk, a reflection, or a little time to rest.';
  if(value.dailyChallenges.includes('Social situations'))return 'Before a social moment, decide on one small choice that supports your intention.';
  if(value.triggers.includes('Stress or difficult feelings'))return 'Make room for a pause. Name what you feel, then choose one kind next step.';
  if(value.recoveryGoal)return `Today, make a little space for ${value.recoveryGoal.toLowerCase()}.`;
  if(value.motivation)return `Come back to your reason: ${value.motivation.toLowerCase()}.`;
  return 'A small pause can help you notice what you need today.';
}
