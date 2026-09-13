const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!motionPreference.matches&&'IntersectionObserver' in window){document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
const canvas=document.querySelector('.ambient-canvas');const ctx=canvas.getContext('2d');const motionButton=document.querySelector('.motion-toggle');
let paused=motionPreference.matches;let frame=0;let last=0;let elapsed=0;let width=0;let height=0;let particles=[];
function resize(){width=window.innerWidth;height=window.innerHeight;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:width<700?24:48},(_,i)=>({x:((i*137.508)%1000)/1000*width,y:((i*231.71)%1000)/1000*height,speed:.3+(i%5)*.12,phase:i*1.3}));draw();}
function draw(){if(!ctx)return;ctx.clearRect(0,0,width,height);const t=elapsed*.00013;const glow=ctx.createRadialGradient(width*(.68+Math.sin(t)*.16),height*.35,0,width*.7,height*.4,width*.7);glow.addColorStop(0,'rgba(54,127,158,.17)');glow.addColorStop(.5,'rgba(35,96,126,.07)');glow.addColorStop(1,'rgba(11,15,18,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
// Abstract drifting nodes and fine connecting lines.
const positions=particles.map(p=>({x:(p.x+Math.sin(t*p.speed+p.phase)*38+width)%width,y:(p.y+Math.cos(t*p.speed+p.phase)*28+height)%height}));
positions.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,i%7===0?1.8:1,0,Math.PI*2);ctx.fillStyle=i%7===0?'rgba(160,225,240,.55)':'rgba(145,205,225,.24)';ctx.fill();for(let j=i+1;j<positions.length;j++){const q=positions[j],distance=Math.hypot(p.x-q.x,p.y-q.y);if(distance<160){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(123,200,225,${(1-distance/160)*.14})`;ctx.lineWidth=.6;ctx.stroke();}}});
// Slow waves stay behind the content and never intercept interactions.
for(let line=0;line<3;line++){ctx.beginPath();for(let x=0;x<=width;x+=14){const y=height*(.42+line*.055)+Math.sin(x/width*5+t+line*.6)*height*.12; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.strokeStyle=`rgba(114,205,231,${.08-line*.016})`;ctx.lineWidth=1;ctx.stroke();}}
function tick(now){frame=0;if(paused||document.hidden)return;if(now-last>=33){elapsed+=Math.min(now-last,50);last=now;draw();}frame=requestAnimationFrame(tick);}
function syncMotion(){cancelAnimationFrame(frame);frame=0;last=performance.now();document.body.classList.toggle('motion-paused',paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'Включить анимацию фона':'Приостановить анимацию фона');motionButton.querySelector('.motion-icon').textContent=paused?'▷':'Ⅱ';if(!paused&&!document.hidden&&ctx)frame=requestAnimationFrame(tick);else draw();}
motionButton.addEventListener('click',()=>{paused=!paused;syncMotion();});motionPreference.addEventListener('change',e=>{paused=e.matches;if(e.matches)document.documentElement.classList.remove('js-motion');syncMotion();});document.addEventListener('visibilitychange',syncMotion);window.addEventListener('resize',resize,{passive:true});resize();syncMotion();
const hero=document.querySelector('.hero');
const chip=document.querySelector('.hero-visual');
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
let pointerFrame=0;
hero.addEventListener('pointermove',event=>{
 if(paused||motionPreference.matches||!finePointer.matches)return;
 const rect=hero.getBoundingClientRect();
 const x=(event.clientX-rect.left)/rect.width-.5;
 const y=(event.clientY-rect.top)/rect.height-.5;
 cancelAnimationFrame(pointerFrame);
 pointerFrame=requestAnimationFrame(()=>{
  if(paused||motionPreference.matches)return;
  chip.style.setProperty('--chip-x',`${x*14}px`);
  chip.style.setProperty('--chip-y',`${y*10}px`);
 });
},{passive:true});
hero.addEventListener('pointerleave',()=>{
 cancelAnimationFrame(pointerFrame);
 if(!paused){chip.style.setProperty('--chip-x','0px');chip.style.setProperty('--chip-y','0px');}
});
let scrollPending=false;
window.addEventListener('scroll',()=>{
 if(scrollPending)return;
 scrollPending=true;
 requestAnimationFrame(()=>{
  if(!paused&&!motionPreference.matches)chip.style.setProperty('--chip-scroll',`${Math.min(window.scrollY,hero.offsetHeight)*.06}px`);
  scrollPending=false;
 });
},{passive:true});
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
 document.body.classList.toggle('hero-out-of-view',!entries[0].isIntersecting);
}).observe(hero);
