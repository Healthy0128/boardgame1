(()=>{'use strict';
const NativeAudio=window.Audio;
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if(!NativeAudio||!AudioCtx)return;
const sfxSources=[
'assets/audio/shogi/shogi_hit_01.ogg','assets/audio/shogi/shogi_hit_02.ogg','assets/audio/shogi/shogi_hit_03.ogg',
'assets/audio/chess/chess_move_01.ogg','assets/audio/chess/chess_move_02.ogg','assets/audio/chess/chess_move_03.ogg',
'assets/audio/reversi/disc_01.ogg','assets/audio/reversi/disc_02.ogg','assets/audio/reversi/disc_03.ogg',
'assets/audio/mancala/stone_01.ogg','assets/audio/mancala/stone_02.ogg','assets/audio/mancala/stone_03.ogg',
'assets/audio/ohajiki/glass_01.ogg','assets/audio/ohajiki/glass_02.ogg','assets/audio/ohajiki/glass_03.ogg','assets/audio/ohajiki/glass_04.ogg','assets/audio/ohajiki/glass_05.ogg','assets/audio/ohajiki/glass_06.ogg'
];
const sfxSet=new Set(sfxSources.map(s=>new URL(s,location.href).href));
const ctx=new AudioCtx({latencyHint:'interactive'});
const buffers=new Map();
const fallbackPools=new Map();
function abs(src){try{return new URL(src,location.href).href}catch{return src}}
function makePool(src){if(fallbackPools.has(src))return fallbackPools.get(src);const pool=Array.from({length:4},()=>{const a=new NativeAudio(src);a.preload='auto';a.load();return a});fallbackPools.set(src,pool);return pool}
function fallbackPlay(src,volume,rate){const pool=makePool(src);let a=pool.find(x=>x.paused||x.ended)||pool[0];try{a.pause();a.currentTime=0}catch{}a.volume=volume;a.playbackRate=rate;return a.play()}
async function load(src){const url=abs(src);try{const r=await fetch(url,{cache:'force-cache'});const b=await r.arrayBuffer();const decoded=await ctx.decodeAudioData(b.slice(0));buffers.set(url,decoded)}catch{makePool(url)}}
sfxSources.forEach(load);
async function unlock(){try{if(ctx.state!=='running')await ctx.resume();const b=ctx.createBuffer(1,1,22050),s=ctx.createBufferSource();s.buffer=b;s.connect(ctx.destination);s.start(0)}catch{}}
['pointerdown','touchstart','mousedown','keydown'].forEach(ev=>addEventListener(ev,unlock,{passive:true,capture:true,once:false}));
function playDecoded(url,volume,rate){const buffer=buffers.get(url);if(!buffer)return null;try{const src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buffer;src.playbackRate.value=rate;gain.gain.value=volume;src.connect(gain);gain.connect(ctx.destination);src.start(ctx.currentTime);return Promise.resolve()}catch{return null}}
function FastSfx(src){this.src=src;this.volume=1;this.playbackRate=1;this.loop=false;this.currentTime=0;this.paused=true;this.ended=false}
FastSfx.prototype.play=function(){const url=abs(this.src);this.paused=false;this.ended=false;const p=playDecoded(url,this.volume,this.playbackRate);if(p)return p;return fallbackPlay(url,this.volume,this.playbackRate).catch(()=>{})};
FastSfx.prototype.pause=function(){this.paused=true};
function PatchedAudio(src){const url=abs(src||'');if(sfxSet.has(url))return new FastSfx(src);return new NativeAudio(src)}
PatchedAudio.prototype=NativeAudio.prototype;
Object.setPrototypeOf(PatchedAudio,NativeAudio);
window.Audio=PatchedAudio;
window.__boardAudio={context:ctx,buffers,unlock};
})();
