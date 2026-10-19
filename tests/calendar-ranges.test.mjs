import test from 'node:test';
import assert from 'node:assert/strict';
import {occursOn,weekSegments} from '../js/dewford-calendar-ranges.js';
const days=['2026-10-18','2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24'];
test('inclusive endpoints and legacy single-day events',()=>{
 const event={startDate:'2026-10-19',endDate:'2026-10-22'};
 assert.equal(occursOn(event,'2026-10-19'),true);assert.equal(occursOn(event,'2026-10-22'),true);
 assert.equal(occursOn(event,'2026-10-23'),false);
 assert.equal(occursOn({date:'2026-10-19'},'2026-10-19'),true);
 assert.equal(occursOn({date:'2026-10-19'},'2026-10-20'),false);
});
test('multiweek ranges produce one label per intersecting week',()=>{
 const event={startDate:'2026-10-16',endDate:'2026-10-27'};
 const segments=weekSegments([event],days);
 assert.equal(segments.length,1);assert.deepEqual([segments[0].start,segments[0].end],[0,6]);
 assert.equal(segments[0].continuesBefore,true);assert.equal(segments[0].continuesAfter,true);
 const next=['2026-10-25','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31'];
 assert.equal(weekSegments([event],next)[0].end,2);
 assert.equal(weekSegments([{date:'2026-11-01'}],next).length,0);
});
test('overlaps occupy separate lanes; disjoint events can reuse a lane',()=>{
 const segments=weekSegments([{date:days[0],endDate:days[2]},{date:days[1],endDate:days[3]},{date:days[4]}],days);
 assert.deepEqual(segments.map(s=>s.lane),[0,1,0]);
});
test('ranges spanning months and leap days remain inclusive',()=>{
 const days=['2028-02-27','2028-02-28','2028-02-29','2028-03-01','2028-03-02','2028-03-03','2028-03-04'];
 const [segment]=weekSegments([{startDate:'2028-02-28',endDate:'2028-03-02'}],days);
 assert.deepEqual([segment.start,segment.end],[1,4]);
});
