const Sound = {
  ctx: null,
  init() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    };
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
  },
  playTone(freq, type, duration, vol = 0.08) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + duration);
    } catch (e) { /* Audio is optional; gameplay should continue. */ }
  },
  jump() { this.playTone(300, 'square', 0.13, 0.06); },
  collect() { this.playTone(650, 'sine', 0.16, 0.08); },
  hazard() { this.playTone(110, 'sawtooth', 0.22, 0.08); },
  win() { [420, 540, 660, 820].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', .18, .07), i * 100)); }
};
Sound.init();
