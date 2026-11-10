const assert=require('node:assert/strict'),E=require('./engine.js');let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++},ok=(a,label)=>{assert.ok(a,label);checks++};
let id=0;const c=r=>({r:String(r),s:'♠',id:'t'+id++}),cards=rs=>rs.map(c),rig=(b,rs)=>b.shoe=[...E.shoe(6),...cards(rs).reverse()];
const scenario=(p,u,bal=5000)=>{const b=E.newBJ();b.phase='player';b.dealer=cards([u,7]);b.hands=[{cards:cards(p),bet:100,done:false,fromSplit:false,splitA:false}];b.bet=100;b.bal=bal;return b};
eq(E.value(cards(['A','A','9'])),{n:21,soft:true});eq(E.value(cards(['A','6','10'])),{n:17,soft:false});eq(E.bv(cards([7,8])),5);
// Independent strategy table for 6 decks, S17, DAS, late surrender.
const columns=[2,3,4,5,6,7,8,9,10,'A'],names={H:'Hit',S:'Stand',D:'Double',P:'Split',R:'Surrender'};
const hard={8:'HHHHHHHHHH',9:'HDDDDHHHHH',10:'DDDDDDDDHH',11:'DDDDDDDDDH',12:'HHSSSHHHHH',13:'SSSSSHHHHH',14:'SSSSSHHHHH',15:'SSSSSHHHRH',16:'SSSSSHHRRR',17:'SSSSSSSSSS',18:'SSSSSSSSSS',19:'SSSSSSSSSS',20:'SSSSSSSSSS'};
for(const [n,row] of Object.entries(hard))for(let j=0;j<10;j++){const n1=+n>=12?10:2,n2=+n-n1;eq(E.strategy(scenario([n1,n2],columns[j])),names[row[j]],`hard ${n}/${columns[j]}`)}
const soft={2:'HHHDDHHHHH',3:'HHHDDHHHHH',4:'HHDDDHHHHH',5:'HHDDDHHHHH',6:'HDDDDHHHHH',7:'SDDDDSSHHH',8:'SSSSSSSSSS',9:'SSSSSSSSSS'};
for(const [r,row] of Object.entries(soft))for(let j=0;j<10;j++)eq(E.strategy(scenario(['A',r],columns[j])),names[row[j]],`soft A${r}/${columns[j]}`);
const pairs={2:'PPPPPPHHHH',3:'PPPPPPHHHH',4:'HHHPPHHHHH',5:'DDDDDDDDHH',6:'PPPPPHHHHH',7:'PPPPPPHHHH',8:'PPPPPPPPPP',9:'PPPPPSPPSS',10:'SSSSSSSSSS',A:'PPPPPPPPPP'};
for(const [r,row] of Object.entries(pairs))for(let j=0;j<10;j++)eq(E.strategy(scenario([r,r],columns[j])),names[row[j]],`pair ${r}/${columns[j]}`);
let b=scenario(['A',7],3,0);eq(E.strategy(b),'Stand','soft18 unavailable double -> stand');b=scenario([5,6],6,0);eq(E.strategy(b),'Hit');
// Exact payout regressions.
b=E.newBJ();b.bet=100;rig(b,['A',9,'K',7]);E.dealBJ(b);eq(b.bal,5150);eq(b.net,150);eq(b.hands[0].done,true);eq(b.round,1);E.settleBJ(b);eq(b.bal,5150,'settlement idempotent');
b=E.newBJ();b.bet=100;rig(b,['A','A','K','K']);E.dealBJ(b);eq(b.bal,5000);eq(b.net,0);
b=E.newBJ();b.bet=100;rig(b,[10,'A',9,'K']);E.dealBJ(b);eq(b.bal,4900);eq(b.phase,'done');
b=E.newBJ();b.bet=100;rig(b,[10,10,6,7]);E.dealBJ(b);E.actBJ(b,'Surrender');eq(b.bal,4950);eq(b.net,-50);eq(E.actBJ(b,'Surrender'),null);
b=E.newBJ();b.bet=100;rig(b,[5,10,6,7,10]);E.dealBJ(b);E.actBJ(b,'Double');eq(b.bal,5200);eq(b.net,200);
b=E.newBJ();b.bet=100;rig(b,['A',10,'A',7,'K',9]);E.dealBJ(b);E.actBJ(b,'Split');eq(b.phase,'done');eq(b.bal,5200,'split ace 21 pays only 1:1');eq(b.hands.length,2);ok(b.hands.every(h=>h.done&&h.cards.length===2));
b=E.newBJ();b.bet=100;rig(b,[10,'A',7,6]);E.dealBJ(b);const remaining=b.shoe.length;E.actBJ(b,'Stand');eq(b.shoe.length,remaining,'S17 dealer must stand');eq(b.bal,5000);
b=E.newBJ();b.bet=100;rig(b,[10,10,6,7,'K']);E.dealBJ(b);E.actBJ(b,'Hit');eq(b.bal,4900);eq(b.net,-100);
b=scenario([8,8],10);b.hands=Array.from({length:4},()=>({...b.hands[0],cards:cards([8,8])}));eq(E.can(b,'Split'),false,'four-hand cap');
// Every cell of the third-card table, not just typical paths.
const third=['1111111111','1111111111','1111111111','1111111101','0011111100','0000111100','0000001100','0000000000'];
for(let n=0;n<8;n++){for(let t=0;t<10;t++)eq(E.bankThird(n,t),third[n][t]==='1',`bank ${n} third ${t}`);eq(E.bankThird(n,null),n<=5)}
for(const rule of ['commission','half'])for(const side of ['player','banker','tie']){eq(E.bacPay(side,'tie',100,rule,7),side==='tie'?900:100);if(side!=='tie')eq(E.bacPay(side,side==='player'?'banker':'player',100,rule,6),0)}
eq(E.bacPay('banker','banker',50,'commission',7),97.5);eq(E.bacPay('banker','banker',100,'half',6),150);eq(E.bacPay('banker','banker',100,'half',7),200);
let a=E.newBac();rig(a,[7,8,'A','K']);E.dealBac(a);eq(a.p.length,2);eq(a.b.length,2);eq(a.win,'tie');eq(a.bal,5000);eq(a.round,1);
a=E.newBac();rig(a,[2,'A',3,2,8]);E.dealBac(a);eq(a.p.length,3);eq(a.b.length,2,'banker3 vs third8 stands');
a=E.newBac();a.rule='half';a.bet=100;rig(a,[3,2,2,4,'K']);E.dealBac(a);eq(a.win,'banker');eq(E.bv(a.b),6);eq(a.bal,5050);
// Thousands of games: conserve funds across splits/doubles and never overdraw.
for(let i=0;i<2500;i++){b=E.newBJ();b.bet=[50,100,200,500][i%4];E.dealBJ(b);let turn=0;while(b.phase==='player'){E.actBJ(b,E.strategy(b));ok(++turn<50)}eq(b.bal,5000+b.net);ok(b.bal>=0);eq(b.history.length,1)}
for(let i=0;i<2500;i++){a=E.newBac();a.side=['player','banker','tie'][i%3];a.rule=i%2?'half':'commission';E.dealBac(a);eq(a.bal,5000+a.net);ok(a.p.length>=2&&a.p.length<=3);ok(a.b.length>=2&&a.b.length<=3)}
const losses=E.simulate('mart','rounds',10,()=>.6);eq(losses.exhausted,10);ok(losses.results.every(n=>n>=-5000&&n<=0));const ties=E.simulate('mart','rounds',2,()=>.99);eq(ties.results,[0,0]);
console.log(JSON.stringify({passed:true,assertions:checks,randomBlackjackRounds:2500,randomBaccaratRounds:2500,strategyCells:310,thirdCardCells:88},null,2));
