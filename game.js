(() => {
  'use strict';
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const ui = {
    level: document.getElementById('ui-level'),
    score: document.getElementById('ui-score'),
    target: document.getElementById('ui-target'),
    lives: document.getElementById('ui-lives'),
    message: document.getElementById('message')
  };
  const W = canvas.width, H = canvas.height;
  const keys = Object.create(null);
  const particles = new ParticleSystem();
  const gravity = 0.55;
  let level = 1, score = 0, lives = 3, state = 'playing';
  let lastTime = 0, invulnerable = 0;
  const player = { x: 45, y: 390, w: 27, h: 34, vx: 0, vy: 0, grounded: false, facing: 1 };
  let platforms, orbs, hazards, portal;

  function buildLevel() {
    platforms = [
      {x:0,y:465,w:800,h:35}, {x:115,y:390,w:145,h:16},
      {x:310,y:320,w:145,h:16}, {x:510,y:250,w:145,h:16},
      {x:665,y:385,w:100,h:16}, {x:35,y:285,w:85,h:16}
    ];
    if (level % 2 === 0) {
      platforms.push({x:250,y:205,w:115,h:16}, {x:430,y:145,w:120,h:16});
    }
    const spots = level % 2 === 0
      ? [[70,250],[170,355],[355,280],[555,210],[475,105],[710,345]]
      : [[75,250],[175,355],[355,280],[555,210],[705,345]];
    orbs = spots.map(([x,y]) => ({x,y,r:9,taken:false}));
    hazards = [{x:285,y:449,w:34,h:16,phase:0},{x:470,y:449,w:34,h:16,phase:2}];
    portal = {x:735,y:415,w:35,h:50};
    player.x = 42; player.y = 420; player.vx = 0; player.vy = 0; player.grounded = false;
    score = 0; state = 'playing'; invulnerable = 0;
    ui.message.textContent = 'COLLECT ALL ORBS, THEN REACH THE PORTAL';
    updateUI();
  }
  function updateUI() {
    ui.level.textContent = level;
    ui.score.textContent = score;
    ui.target.textContent = orbs.filter(o => !o.taken).length + score;
    ui.lives.textContent = lives;
  }
  function overlap(a,b) {
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function respawn() {
    lives--; updateUI(); Sound.hazard();
    particles.spawn(player.x+player.w/2, player.y+player.h/2, '#ff3864');
    if (lives <= 0) {
      state = 'gameover'; ui.message.textContent = 'GAME OVER — PRESS R TO TRY AGAIN'; return;
    }
    player.x=42; player.y=420; player.vx=0; player.vy=0; invulnerable=100;
  }
  function jump() {
    if (state !== 'playing') return;
    if (player.grounded) { player.vy=-12.2; player.grounded=false; Sound.jump(); }
  }
  function update(dt) {
    if (state !== 'playing') { particles.update(); return; }
    const step = Math.min(dt / 16.67, 2);
    const left = keys.ArrowLeft || keys.KeyA || keys.touchLeft;
    const right = keys.ArrowRight || keys.KeyD || keys.touchRight;
    player.vx = left ? -4.2 : right ? 4.2 : 0;
    if (player.vx) player.facing = Math.sign(player.vx);
    player.x += player.vx * step;
    player.x = Math.max(0, Math.min(W-player.w, player.x));
    const oldBottom = player.y + player.h;
    player.vy = Math.min(player.vy + gravity*step, 13);
    player.y += player.vy*step;
    player.grounded = false;
    if (player.vy >= 0) {
      for (const p of platforms) {
        if (oldBottom <= p.y + 5 && player.y+player.h >= p.y &&
            player.x+player.w > p.x && player.x < p.x+p.w) {
          player.y=p.y-player.h; player.vy=0; player.grounded=true;
        }
      }
    }
    if (player.y > H+80) respawn();
    if (invulnerable > 0) invulnerable -= step;
    for (const o of orbs) {
      if (!o.taken && Math.hypot(player.x+player.w/2-o.x, player.y+player.h/2-o.y)<25) {
        o.taken=true; score++; Sound.collect(); particles.spawn(o.x,o.y,'#ffe66d'); updateUI();
      }
    }
    for (const h of hazards) {
      h.phase += .04*step;
      const moving = {x:h.x+Math.sin(h.phase)*22,y:h.y,w:h.w,h:h.h};
      if (invulnerable<=0 && overlap(player,moving)) respawn();
    }
    if (score === orbs.length && overlap(player,portal)) {
      state='won'; Sound.win(); ui.message.textContent='LEVEL CLEARED! PRESS ENTER FOR NEXT LEVEL';
    } else if (score < orbs.length && overlap(player,portal)) {
      ui.message.textContent='PORTAL LOCKED — COLLECT EVERY ORB';
    } else if (state==='playing') {
      ui.message.textContent='COLLECT ALL ORBS, THEN REACH THE PORTAL';
    }
    particles.update();
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#0b1730'); bg.addColorStop(1,'#070914');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#123b55'; ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    platforms.forEach(p=>{
      ctx.fillStyle='#102c42';ctx.fillRect(p.x,p.y,p.w,p.h);
      ctx.fillStyle='#00eaff';ctx.shadowColor='#00eaff';ctx.shadowBlur=12;ctx.fillRect(p.x,p.y,p.w,3);ctx.shadowBlur=0;
    });
    hazards.forEach(h=>{
      const x=h.x+Math.sin(h.phase)*22;
      ctx.fillStyle='#ff315c';ctx.shadowColor='#ff315c';ctx.shadowBlur=14;
      ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+h.w/2,h.y-7);ctx.lineTo(x+h.w,h.y+h.h);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
    });
    orbs.forEach(o=>{if(o.taken)return;ctx.beginPath();ctx.arc(o.x,o.y, o.r+Math.sin(Date.now()/140)*1.5,0,Math.PI*2);
      ctx.fillStyle='#ffe66d';ctx.shadowColor='#ffe66d';ctx.shadowBlur=16;ctx.fill();ctx.shadowBlur=0;});
    ctx.strokeStyle=score===orbs.length?'#65ff9a':'#a04dff';ctx.lineWidth=4;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=18;
    ctx.strokeRect(portal.x,portal.y,portal.w,portal.h);ctx.shadowBlur=0;
    if(invulnerable<=0 || Math.floor(invulnerable/7)%2===0){
      ctx.fillStyle='#00f3ff';ctx.shadowColor='#00f3ff';ctx.shadowBlur=18;
      ctx.fillRect(player.x,player.y,player.w,player.h);ctx.shadowBlur=0;
      ctx.fillStyle='#07111c';ctx.fillRect(player.x+(player.facing>0?16:5),player.y+9,5,5);
    }
    particles.draw(ctx);
    if(state==='gameover'||state==='won'){
      ctx.fillStyle='#02050bcc';ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';ctx.shadowBlur=18;ctx.shadowColor=state==='won'?'#65ff9a':'#ff315c';
      ctx.fillStyle=state==='won'?'#65ff9a':'#ff6684';ctx.font='bold 34px Courier New';
      ctx.fillText(state==='won'?'LEVEL CLEARED':'GAME OVER',W/2,H/2-8);
      ctx.shadowBlur=0;ctx.fillStyle='#ffffff';ctx.font='18px Courier New';
      ctx.fillText(state==='won'?'Press ENTER for next level':'Press R to restart',W/2,H/2+30);
    }
  }
  function loop(t) { const dt=lastTime? t-lastTime:16.67; lastTime=t; update(dt); draw(); requestAnimationFrame(loop); }
  window.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','Space'].includes(e.code)) e.preventDefault();
    keys[e.code]=true;
    if(['Space','ArrowUp','KeyW'].includes(e.code) && !e.repeat) jump();
    if(e.code==='KeyR') {level=1;lives=3;buildLevel();}
    if(e.code==='Enter' && state==='won'){level++;buildLevel();}
    if(state==='gameover' && e.code==='Enter'){level=1;lives=3;buildLevel();}
  });
  window.addEventListener('keyup',e=>{keys[e.code]=false;});
  function bindHold(id,key) {
    const el=document.getElementById(id);
    const on=ev=>{ev.preventDefault();keys[key]=true;};
    const off=ev=>{ev.preventDefault();keys[key]=false;};
    el.addEventListener('pointerdown',on); ['pointerup','pointerleave','pointercancel'].forEach(n=>el.addEventListener(n,off));
  }
  bindHold('leftBtn','touchLeft'); bindHold('rightBtn','touchRight');
  document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault();jump();});
  buildLevel(); requestAnimationFrame(loop);
})();
