class ParticleSystem {
  constructor() { this.particles = []; }
  spawn(x, y, color) {
    for (let i = 0; i < 8; i++) this.particles.push({
      x, y, vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 6,
      life: 1, decay: Math.random() * .04 + .02, color
    });
  }
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }
  draw(ctx) {
    this.particles.forEach(p => {
      ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fillRect(p.x, p.y, 4, 4); ctx.restore();
    });
  }
}
