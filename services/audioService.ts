class AudioService {
  private ctx: AudioContext | null = null;
  private musicNodes: AudioScheduledSourceNode[] = [];
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private tempo: number = 250; // ms per beat

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private initCtx() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.isMusicPlaying) {
      this.startMusic();
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  playPopSound() {
    if (this.isMuted || !this.ctx) return;
    this.initCtx();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playHitSound() {
    if (this.isMuted || !this.ctx) return;
    this.initCtx();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playGameOverSound() {
    if (this.isMuted || !this.ctx) return;
    this.initCtx();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  // --- Music (Simple Generative Sequence) ---

  startMusic() {
    if (this.isMuted || !this.ctx || this.isMusicPlaying) return;
    this.initCtx();
    this.isMusicPlaying = true;
    this.playNextNote(this.ctx.currentTime);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    this.musicNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.musicNodes = [];
  }

  private playNextNote(startTime: number) {
    if (!this.isMusicPlaying || !this.ctx) return;

    // A happy major pentatonic melody
    const sequence = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25]; // C E G C G E
    const noteDuration = 0.2;
    const interval = 0.25;

    // Loop through the sequence slightly randomly
    const noteFreq = sequence[Math.floor(Math.random() * sequence.length)];
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.value = noteFreq;
    
    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05); // Attack
    gain.gain.linearRampToValueAtTime(0, startTime + noteDuration); // Release

    osc.start(startTime);
    osc.stop(startTime + noteDuration);
    
    this.musicNodes.push(osc);

    // Schedule next note
    // Clean up old nodes array occasionally
    if (this.musicNodes.length > 10) this.musicNodes.shift();
    
    const nextTime = startTime + interval;
    // Use window.setTimeout to schedule the next loop iteration (standard pattern for web audio scheduling loops)
    const delay = (nextTime - this.ctx.currentTime) * 1000;
    
    setTimeout(() => {
        if(this.isMusicPlaying) this.playNextNote(Math.max(nextTime, this.ctx!.currentTime + 0.01));
    }, Math.max(0, delay - 20)); // wake up slightly early
  }
}

export const audioService = new AudioService();