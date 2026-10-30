(()=>{'use strict';
const canvas=document.getElementById('gameCanvas'),c=canvas.getContext('2d'),W=900,H=540,$=id=>document.getElementById(id),keys={},fx=new ParticleSystem();
let level=1,lives=3,score=0,best=0,state='menu',last=0,inv=0,platforms=[],orbs=[],hazards=[],drones=[],portal={x:830,y:447,w:35,h:58},boss=null;
const player={x:30,y:455,w:28,h:36,vx:0,vy:0,ground:false,face:1};
try{best=Number(localStorage.getItem('neonCyberBest')||0)}catch(e){}
const screens=['menuScreen','pauseScreen','infoScreen','endScreen'];
function show(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id))}
function updateBest(){if(score>best){best=score;try{localStorage.setItem('neonCyberBest',String(best))}catch(e){}}$('bestValue').textContent=best;$('menuBest').textContent=best}
function hud(){$('levelValue').textContent=level;$('orbValue').textContent=orbs.filter(o=>!o.taken).length+'/'+orbs.length;$('livesValue').textContent=lives;$('scoreValue').textContent=score;updateBest()}
// Ten distinct platform layouts and orb paths; later levels add more hazards and faster drones.
const layouts=[
{p:[[0,505,900,35],[115,420,145,16],[325,345,145,16],[555,270,145,16],[735,410,125,16],[25,310,90,16]],o:[[65,275],[180,385],[370,310],[600,235],[780,375]]},
{p:[[0,505,900,35],[65,430,120,16],[245,365,110,16],[410,295,115,16],[590,225,115,16],[770,390,105,16]],o:[[105,395],[280,330],[445,260],[625,190],[805,355],[460,470]]},
{p:[[0,505,900,35],[35,425,115,16],[205,345,115,16],[375,265,115,16],[545,345,115,16],[715,265,150,16]],o:[[75,390],[245,310],[415,230],[585,310],[765,230],[450,470],[120,470]]},
{p:[[0,505,900,35],[110,425,105,16],[275,340,105,16],[440,255,105,16],[605,340,105,16],[770,425,100,16]],o:[[145,390],[310,305],[475,220],[640,305],[805,390],[450,470]]},
{p:[[0,505,900,35],[55,425,100,16],[210,350,100,16],[365,275,100,16],[520,200,100,16],[675,125,100,16],[810,390,80,16]],o:[[90,390],[245,315],[400,240],[555,165],[710,90],[850,355],[450,470]]},
{p:[[0,505,900,35],[35,410,115,16],[210,315,115,16],[385,410,115,16],[560,315,115,16],[735,220,130,16]],o:[[75,375],[250,280],[425,375],[600,280],[790,185],[450,470],[120,470]]},
{p:[[0,505,900,35],[85,430,95,16],[225,360,95,16],[365,290,95,16],[505,220,95,16],[645,290,95,16],[785,400,90,16]],o:[[120,395],[260,325],[400,255],[540,185],[680,255],[825,365],[450,470],[70,470]]},
{p:[[0,505,900,35],[25,420,115,16],[190,335,115,16],[355,250,115,16],[520,335,115,16],[685,420,115,16],[800,285,90,16]],o:[[65,385],[230,300],[395,215],[560,300],[725,385],[845,250],[450,470],[120,470]]},
{p:[[0,505,900,35],[75,430,95,16],[220,350,95,16],[365,270,95,16],[510,190,95,16],[655,270,95,16],[800,350,85,16]],o:[[110,395],[255,315],[400,235],[545,155],[690,235],[835,315],[450,470],[150,470],[750,470]]},
{p:[[0,505,900,35],[35,420,105,16],[185,350,105,16],[335,280,105,16],[485,210,105,16],[635,280,105,16],[785,420,100,16]],o:[[85,385],[235,315],[385,245],[535,175],[685,245],[835,385],[450,470],[120,470],[780,470]]}
];
function build(n){level=n;const d=layouts[n-1];platforms=d.p.map(a=>({x:a[0],y:a[1],w:a[2],h:a[3]}));orbs=d.o.map(a=>({x:a[0],y:a[1],taken:false,r:9}));hazards=Array.from({length:Math.min(1+Math.floor((n-1)/2),5)},(_,i)=>({x:155+i*145,y:487,w:32,h:15,phase:i*1.8,speed:.025+n*.003}));drones=Array.from({length:Math.min(Math.floor((n-1)/3),3)},(_,i)=>({x:240+i*210,y:platforms[1+i].y-25,base:platforms[1+i].y-25,phase:i*2,speed:.035+n*.002}));boss=n===10?{x:700,y:415,w:90,h:90,hp:3,phase:0,exposed:false}:null;portal={x:830,y:447,w:35,h:58};player.x=25;player.y=455;player.vx=player.vy=0;player.ground=false;inv=0;score=score;state='playing';show(null);hud()}
function menu(){state='menu';show('menuScreen');updateBest()}
function pause(){if(state==='playing'){state='paused';show('pauseScreen')}else if(state==='paused'){state='playing';show(null)}}
function finish(win){state=win?'won':'lost';updateBest();$('endEyebrow').textContent=win?'MISSION COMPLETE':'RUN OVER';$('endTitle').textContent=win?'CYBER CITY SAVED':'GAME OVER';$('endText').textContent=win?'You defeated the final boss and completed all 10 levels! Final score: '+score:'Your run ended. Personal best: '+best;$('nextBtn').textContent=win?'PLAY AGAIN':'TRY AGAIN';show('endScreen')}
function respawn(){lives--;Sound.hit();fx.burst(player.x+14,player.y+18,'#ff426d');if(lives<=0){hud();$('endEyebrow').textContent='RUN OVER';$('endTitle').textContent='GAME OVER';$('endText').textContent='Try again. Personal best: '+best;$('nextBtn').textContent='TRY AGAIN';state='lost';show('endScreen')}else{player.x=25;player.y=455;player.vx=player.vy=0;inv=100;hud()}}
function jump(){if(state==='playing'&&player.ground){player.vy=-13;player.ground=false;Sound.jump()}}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt){const s=Math.min(dt/16.67,2);if(state!=='playing'){fx.update();return}
 const left=keys.ArrowLeft||keys.KeyA||keys.left,right=keys.ArrowRight||keys.KeyD||keys.right;player.vx=left?-4.3:right?4.3:0;if(player.vx)player.face=Math.sign(player.vx);player.x=Math.max(0,Math.min(W-player.w,player.x+player.vx*s));
 const oldBottom=player.y+player.h;player.vy=Math.min(player.vy+.58*s,14);player.y+=player.vy*s;player.ground=false;
 if(player.vy>=0)for(const q of platforms)if(oldBottom<=q.y+7&&player.y+player.h>=q.y&&player.x+player.w>q.x&&player.x<q.x+q.w){player.y=q.y-player.h;player.vy=0;player.ground=true}
 if(player.y>H+65)respawn();if(inv>0)inv-=s;
 for(const o of orbs)if(!o.taken&&Math.hypot(player.x+14-o.x,player.y+18-o.y)<25){o.taken=true;score+=100;Sound.collect();fx.burst(o.x,o.y,'#ffe66d');hud()}
 for(const h of hazards){h.phase+=h.speed*s;const b={x:h.x+Math.sin(h.phase)*40,y:h.y-12,w:h.w,h:h.h};if(inv<=0&&overlap(player,b))respawn()}
 for(const d of drones){d.phase+=d.speed*s;const b={x:d.x+Math.sin(d.phase)*55,y:d.base+Math.sin(d.phase*1.5)*13,w:30,h:24};if(inv<=0&&overlap(player,b))respawn()}
 if(boss){boss.phase+=.035*s;boss.exposed=Math.sin(boss.phase)>-.15;boss.x=690+Math.sin(boss.phase*.55)*65;
   const bb={x:boss.x,y:boss.y,w:boss.w,h:boss.h};
   if(boss.exposed&&player.vy>0&&player.y+player.h>=boss.y&&player.y+player.h<=boss.y+22&&player.x+player.w>boss.x&&player.x<boss.x+boss.w){boss.hp--;player.vy=-10;score+=500;fx.burst(boss.x+45,boss.y,'#ff4fe1');Sound.win();if(boss.hp<=0){boss=null;score+=1000}}
   else if(inv<=0&&overlap(player,bb))respawn();
 }
 if(boss===null&&level===10&&score>=0&&orbs.every(o=>o.taken)&&overlap(player,portal)){finish(true)}
 if(!boss&&level<10&&orbs.every(o=>o.taken)&&overlap(player,portal)){if(level===10)finish(true);else{state='won';$('endEyebrow').textContent='LEVEL COMPLETE';$('endTitle').textContent='LEVEL '+level+' CLEARED';$('endText').textContent='Great work! Score: '+score;$('nextBtn').textContent='NEXT LEVEL';show('endScreen')}}
 hud();fx.update()}
function draw(){c.clearRect(0,0,W,H);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c1b38');g.addColorStop(1,'#070a17');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.strokeStyle='#15324c';c.lineWidth=1;for(let x=0;x<W;x+=45){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=45){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
 platforms.forEach(q=>{c.fillStyle='#102c46';c.fillRect(q.x,q.y,q.w,q.h);c.fillStyle='#35f4ff';c.shadowColor='#35f4ff';c.shadowBlur=13;c.fillRect(q.x,q.y,q.w,3);c.shadowBlur=0});
 hazards.forEach(h=>{const x=h.x+Math.sin(h.phase)*40;c.fillStyle='#ff386b';c.shadowColor='#ff386b';c.shadowBlur=14;c.beginPath();c.moveTo(x,h.y);c.lineTo(x+h.w/2,h.y-22);c.lineTo(x+h.w,h.y);c.fill();c.shadowBlur=0});
 drones.forEach(d=>{const x=d.x+Math.sin(d.phase)*55,y=d.base+Math.sin(d.phase*1.5)*13;c.fillStyle='#ff4fe1';c.shadowColor='#ff4fe1';c.shadowBlur=15;c.fillRect(x,y,30,24);c.fillStyle='#fff';c.fillRect(x+7,y+8,5,5);c.fillRect(x+19,y+8,5,5);c.shadowBlur=0});
 orbs.forEach(o=>{if(o.taken)return;c.beginPath();c.arc(o.x,o.y,o.r+Math.sin(Date.now()/130)*1.5,0,Math.PI*2);c.fillStyle='#ffe66d';c.shadowColor='#ffe66d';c.shadowBlur=17;c.fill();c.shadowBlur=0});
 c.strokeStyle=orbs.every(o=>o.taken)?'#65ff9a':'#b34dff';c.lineWidth=4;c.shadowColor=c.strokeStyle;c.shadowBlur=20;c.strokeRect(portal.x,portal.y,portal.w,portal.h);c.shadowBlur=0;
 if(boss){c.fillStyle=boss.exposed?'#ff4fe1':'#7c315f';c.shadowColor='#ff4fe1';c.shadowBlur=24;c.fillRect(boss.x,boss.y,boss.w,boss.h);c.shadowBlur=0;c.fillStyle='#fff';c.fillRect(boss.x+18,boss.y+22,14,9);c.fillRect(boss.x+58,boss.y+22,14,9);c.fillStyle='#ff4fe1';c.fillRect(690,115,150,9);c.fillStyle='#ffe66d';c.fillRect(690,115,150*(boss.hp/3),9);c.fillStyle='#fff';c.font='12px monospace';c.fillText('BOSS CORE '+(boss.exposed?'EXPOSED':'SHIELDED'),690,105)}
 if(inv<=0||Math.floor(inv/7)%2===0){c.fillStyle='#35f4ff';c.shadowColor='#35f4ff';c.shadowBlur=18;c.fillRect(player.x,player.y,player.w,player.h);c.shadowBlur=0;c.fillStyle='#06101c';c.fillRect(player.x+(player.face>0?17:6),player.y+9,5,5)}
 fx.draw(c);if(state==='playing'){c.fillStyle='#a9c2da';c.font='12px monospace';c.fillText('SCORE '+score,18,24);c.fillText('EXIT '+(orbs.every(o=>o.taken)?'UNLOCKED':'LOCKED'),W-145,24);if(level===10&&boss)c.fillText('JUMP ON EXPOSED CORE TO DAMAGE BOSS',18,45)}}
function loop(t){const dt=last?t-last:16.67;last=t;update(dt);draw();requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(['Space','ArrowUp','KeyW'].includes(e.code)&&!e.repeat)jump();if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat)pause();if(e.code==='Enter'&&state==='won')nextLevel();if(e.code==='KeyR'&&state==='lost'){lives=3;score=0;build(1)}});
window.addEventListener('keyup',e=>keys[e.code]=false);
function hold(id,key){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>el.addEventListener(ev,()=>keys[key]=false))}
hold('leftBtn','left');hold('rightBtn','right');$('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump()});$('pauseTouchBtn').onclick=pause;
$('playBtn').onclick=()=>{lives=3;score=0;build(1)};$('instructionsBtn').onclick=()=>show('infoScreen');$('backBtn').onclick=menu;$('resumeBtn').onclick=pause;$('restartBtn').onclick=()=>build(level);$('quitBtn').onclick=menu;$('endMenuBtn').onclick=menu;
function nextLevel(){if(level>=10){lives=3;score=0;build(1)}else build(level+1)}
$('nextBtn').onclick=()=>{if(state==='won'){if(level<10)nextLevel();else{lives=3;score=0;build(1)}}else{lives=3;score=0;build(1)}};
menu();requestAnimationFrame(loop);
})();