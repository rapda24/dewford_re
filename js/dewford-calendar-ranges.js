// Legacy single-day entries use `date`; new entries have inclusive range endpoints.
export const startOf = event => event.startDate || event.date;
export const endOf = event => event.endDate || startOf(event);
export const occursOn = (event, day) => startOf(event) <= day && endOf(event) >= day;
export function weekSegments(events, days) {
 const lanes=[];
 return events.map((event,index)=>({event,index,start:days.findIndex(day=>occursOn(event,day))}))
  .filter(segment=>segment.start>=0)
  .sort((a,b)=>a.start-b.start || startOf(a.event).localeCompare(startOf(b.event)) || a.index-b.index)
  .map(segment=>{
   let end=segment.start;while(end<6&&occursOn(segment.event,days[end+1]))end++;
   let lane=lanes.findIndex(last=>last<segment.start);if(lane<0)lane=lanes.length;
   lanes[lane]=end;
   return {...segment,end,lane,continuesBefore:startOf(segment.event)<days[0],continuesAfter:endOf(segment.event)>days[6]};
  });
}
