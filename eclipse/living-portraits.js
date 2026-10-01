(() => {
  'use strict';

  // One GPU context paints an atlas; individual cards receive their own 2D surface.
  // This keeps cards inside normal DOM clipping without allocating a context per card.
  const portraits = new Map(), textures = new Map(), rigs=window.EclipsePortraitMotion;
  if(!rigs)return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const modal = document.getElementById('dialog');
  const atlas = document.createElement('canvas');
  let gl, program, uniforms, unavailable = false, frameId = 0, lastPaint = 0, needsSync = false;


  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = vec2(position.x * .5 + .5, .5 - position.y * .5);
      gl_Position = vec4(position, 0., 1.);
    }`;
  const fragment = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D artwork;
    uniform vec4 crop, head, eye0, eye1, cloth0, cloth1;
    uniform vec4 hair0, hair1;
    uniform vec3 tip0, tip1;
    uniform vec2 neck, eyeAngles;
    uniform vec4 pose,hand;
    uniform float gesture;
    uniform vec3 motion;
    const vec2 metric=vec2(1.,1.5);
    float oval(vec2 p,vec4 r){return 1.-smoothstep(.64,1.,length((p-r.xy)/r.zw));}
    mat2 rotation(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
    float strand(vec2 p,vec4 ab,vec3 tip){
      float t=clamp((p.y-ab.y)/(tip.y-ab.y),0.,1.);
      float x=mix(mix(ab.x,ab.z,t),mix(ab.z,tip.x,t),t);
      float edge=1.-smoothstep(.35,1.,abs(p.x-x)/tip.z);
      return edge*pow(t,1.5)*smoothstep(ab.y,ab.y+.025,p.y)*(1.-smoothstep(tip.y-.055,tip.y,p.y));
    }
    vec4 blinkEye(vec2 p,vec4 eye,float angle,vec4 original){
      vec2 q=rotation(-angle)*((p-eye.xy)*metric);
      vec2 r=eye.zw*metric;
      vec2 local=q/r;
      if(motion.z<.001||abs(local.x)>1.18||abs(local.y)>1.7)return original;
      float span=sqrt(max(0.,1.-pow(local.x/1.16,2.)));
      float upper=-1.36*span;
      float lid=mix(upper,.62*span,motion.z);
      float coverage=smoothstep(upper-.16,upper+.12,local.y)*(1.-smoothstep(lid-.12,lid+.12,local.y));
      coverage*=1.-smoothstep(.96,1.16,abs(local.x));
      // Blend nearby skin tones, rather than stretching a row of eyebrow / hair pixels.
      vec2 skinA=eye.xy+(rotation(angle)*vec2(-r.x*.42,-r.y*1.9))/metric;
      vec2 skinB=eye.xy+(rotation(angle)*vec2(r.x*.42,-r.y*1.9))/metric;
      vec2 skinC=eye.xy+(rotation(angle)*vec2(0.,r.y*2.1))/metric;
      vec3 skin=mix(texture2D(artwork,skinA).rgb,texture2D(artwork,skinB).rgb,clamp(local.x*.35+.5,0.,1.));
      skin=mix(skin,texture2D(artwork,skinC).rgb,.2);
      skin*=1.-.08*smoothstep(upper,.6,local.y);
      vec4 color=mix(original,vec4(skin,1.),coverage*smoothstep(0.,.16,motion.z));
      float lash=(1.-smoothstep(.025,.14,abs(local.y-lid)))*span*motion.z;
      color.rgb=mix(color.rgb,skin*.38,lash*.8);
      return color;
    }
    void main(){
      vec2 p=crop.xy+uv*crop.zw;
      float faceMask=oval(p,head);
      float torso=oval(p,vec4(neck.x,.48,.31,.46));
      p.x-=pose.y*max(torso,faceMask);
      vec2 turned=neck+(rotation(-pose.x)*((p-neck)*metric))/metric;
      turned.y-=pose.z;
      p=mix(p,turned,faceMask);
      float arm=oval(p,hand);vec2 wrist=hand.xy+vec2(-.07,.11);
      p=mix(p,wrist+(rotation(-gesture)*((p-wrist)*metric))/metric,arm);
      float lockedFace=oval(p,vec4(head.xy+vec2(0.,.006),head.zw*vec2(.77,.83)));
      float hairA=strand(p,hair0,tip0),hairB=strand(p,hair1,tip1);
      p.x-=(hairA*pose.w+hairB*motion.x)*(1.-lockedFace);
      p.y-=hairB*motion.x*.14*(1.-lockedFace);
      float fabric=oval(p,cloth0)+oval(p,cloth1);
      p.x-=fabric*(motion.x*.7+sin(motion.y*.85+p.y*8.)*.005)*smoothstep(.35,.9,p.y);
      vec4 color=texture2D(artwork,clamp(p,.001,.999));
      color=blinkEye(p,eye0,eyeAngles.x,color);
      color=blinkEye(p,eye1,eyeAngles.y,color);
      gl_FragColor=color;
    }
`;

  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
      gl.deleteShader(result);
      throw new Error('Portrait shader unavailable');
    }
    return result;
  }

  function setup() {
    if (gl || unavailable) return !!gl;
    let context;
    try {
      gl = context = atlas.getContext('webgl', {alpha:false, antialias:false, depth:false, stencil:false, preserveDrawingBuffer:false});
      if (!gl) throw new Error('WebGL unavailable');
      const v = shader(gl.VERTEX_SHADER, vertex), f = shader(gl.FRAGMENT_SHADER, fragment);
      program = gl.createProgram();
      gl.attachShader(program, v); gl.attachShader(program, f); gl.linkProgram(program);
      gl.deleteShader(v); gl.deleteShader(f);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Portrait program unavailable');
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(['artwork','crop','head','neck','eye0','eye1','eyeAngles','hair0','hair1','tip0','tip1','cloth0','cloth1','pose','motion','hand','gesture'].map(name => [name, gl.getUniformLocation(program, name)]));
      gl.uniform1i(uniforms.artwork, 0);
      gl.disable(gl.DEPTH_TEST);
      return true;
    } catch {
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null; unavailable = true;
      return false;
    }
  }

  function texture(url) {
    if (textures.has(url)) return textures.get(url);
    const entry = {image:new Image(), ready:false, failed:false, texture:null};
    textures.set(url, entry);
    entry.image.onload = () => {
      entry.ready = true;
      if (gl) {
        entry.texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, entry.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, entry.image);
      }
      wake();
    };
    entry.image.onerror = () => {entry.failed = true;};
    entry.image.src = url;
    return entry;
  }

  function active(p) {
    return p.visible && !document.hidden && !reduced.matches && (!modal?.open || modal.contains(p.node));
  }

  function measure(p) {
    const w = p.node.clientWidth, h = p.node.clientHeight;
    if (!w || !h) return false;
    const ratio = Math.min(devicePixelRatio || 1, 1.5, 1000 / Math.max(w,h));
    p.width = Math.max(1, Math.round(w * ratio)); p.height = Math.max(1, Math.round(h * ratio));
    if (p.canvas.width !== p.width || p.canvas.height !== p.height) {
      p.canvas.width = p.width; p.canvas.height = p.height;
    }
    const style = getComputedStyle(p.node), imageAspect = p.art.image.width / p.art.image.height;
    const x = Math.min(1, (w / h) / imageAspect), y = Math.min(1, imageAspect / (w / h));
    const percent = (value, fallback) => value.endsWith('%') ? parseFloat(value) / 100 : fallback;
    p.crop = [(1-x)*percent(style.backgroundPositionX,.5), (1-y)*percent(style.backgroundPositionY,.25), x, y];
    const authored=p.node.dataset.motionCrop?.split(',').map(Number);
    if(authored?.length===4&&authored.every(Number.isFinite)&&authored[2]>0&&authored[3]>0)p.crop=authored;
    p.dirty = false;
    return true;
  }

  function decorate(p){
    const ctx=p.context,r=p.rig,t=p.pose.time,[cx,cy,cw,ch]=p.crop;
    const project=(x,y)=>[(x-cx)/cw*p.width,(y-cy)/ch*p.height];
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<9;i++){
      const depth=.5+(i%3)*.25,life=(t*(.032+depth*.007)+i*.171+r.seed*.01)%1;
      const x=.06+((i*.237)% .88)+Math.sin(t*.27+i*2.7)*.035,y=1.02-life*1.1;
      if(Math.hypot((x-r.head[0])/r.head[2],(y-r.head[1])/r.head[3])<1.3)continue;
      const [px,py]=project(x,y),radius=Math.max(.55,p.width/cw/450)*depth;
      ctx.save();ctx.translate(px,py);ctx.rotate(t*(i%2?.16:-.2)+i);ctx.globalAlpha=Math.sin(life*Math.PI)*.46;
      ctx.fillStyle=r.motes==='prism'?['#d7c2ff','#b2f6ff','#ffd4e6'][i%3]:r.color;
      ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=radius*3;
      if(r.motes==='petals'){
        ctx.scale(Math.cos(t*.8+i)*.3+.75,1);ctx.beginPath();ctx.ellipse(0,0,radius*2.5,radius,0,0,Math.PI*2);ctx.fill();
      }else if(r.motes==='butterflies'&&i%3===0){
        const wing=radius*3*(.35+Math.abs(Math.sin(t*4+i))*.65);ctx.beginPath();ctx.ellipse(-wing*.5,0,wing*.6,radius*1.5,-.4,0,Math.PI*2);ctx.ellipse(wing*.5,0,wing*.6,radius*1.5,.4,0,Math.PI*2);ctx.fill();
      }else{ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
    if(r.orb){
      const [x,y,rad]=r.orb,a=p.pose.gesture,dx=.07,dy=-.11*1.5,[px,py]=project(x-.07+Math.cos(a)*dx-Math.sin(a)*dy,y+.11+(Math.sin(a)*dx+Math.cos(a)*dy)/1.5),rx=rad/cw*p.width;
      ctx.translate(px,py);ctx.rotate(-.28);ctx.scale(1,.35);ctx.strokeStyle=r.color;ctx.lineWidth=Math.max(.6,rx*.009);ctx.globalAlpha=.36;
      ctx.beginPath();ctx.ellipse(0,0,rx*1.2,rx*1.2,0,t*.32,t*.32+1.5);ctx.stroke();
      ctx.globalAlpha=.7;ctx.fillStyle=r.color;ctx.shadowColor=r.color;ctx.shadowBlur=5;ctx.beginPath();ctx.arc(Math.cos(t*.32)*rx*1.2,Math.sin(t*.32)*rx*1.2,Math.max(.7,rx*.025),0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function fallbackEyes(p){
    if(p.pose.blink<.05)return;
    const ctx=p.context,img=p.art.image,[cx,cy,cw,ch]=p.crop;
    if(!p.eyeColors){
      const sample=document.createElement('canvas');sample.width=img.width;sample.height=img.height;
      const read=sample.getContext('2d',{willReadFrequently:true});read.drawImage(img,0,0);
      p.eyeColors=p.rig.eyes.map(([x,y,rx,ry,a])=>{
        const at=(dx,dy)=>{const px=Math.round(x*img.width+Math.cos(a)*dx-Math.sin(a)*dy),py=Math.round(y*img.height+Math.sin(a)*dx+Math.cos(a)*dy);return read.getImageData(px,py,1,1).data;};
        const left=at(-rx*img.width*.42,-ry*img.height*1.9),right=at(rx*img.width*.42,-ry*img.height*1.9),lower=at(0,ry*img.height*2.1);
        return [...left].slice(0,3).map((v,i)=>Math.round((v+right[i])*.4+lower[i]*.2));
      });sample.width=sample.height=1;
    }
    p.rig.eyes.forEach((eye,i)=>{
      const [x,y,rx,ry,angle]=eye,px=(x-cx)/cw*p.width,py=(y-cy)/ch*p.height,w=rx/cw*p.width,h=ry/ch*p.height;
      if(py+h<0||py-h>p.height)return;
      const lid=(-1.36+1.98*p.pose.blink)*h,skin=p.eyeColors[i];
      ctx.save();ctx.translate(px,py);ctx.rotate(angle);ctx.globalAlpha=Math.min(1,p.pose.blink/.16);
      const fill=ctx.createLinearGradient(0,-h*1.36,0,h*.62);fill.addColorStop(0,`rgb(${skin.join(',')})`);fill.addColorStop(1,`rgb(${skin.map(v=>Math.round(v*.92)).join(',')})`);ctx.fillStyle=fill;
      ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-h*2.5,w,0);ctx.quadraticCurveTo(0,lid*2,-w,0);ctx.fill();
      ctx.globalAlpha=p.pose.blink*.8;ctx.strokeStyle=`rgb(${skin.map(v=>Math.round(v*.38)).join(',')})`;ctx.lineWidth=Math.max(.55,h*.12);ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,lid*2,w,0);ctx.stroke();ctx.restore();
    });
  }

  function paint(now) {
    frameId = 0;
    if (needsSync) sync();
    const visible = [...portraits.values()].filter(active);
    for (const p of portraits.values()) p.node.classList.toggle('is-live-visible', active(p));
    if (!visible.length) {lastPaint=now;return;}
    const gpu=setup();
    if (now - lastPaint >= 1000 / 30) {
      const elapsed=Math.min(.1,(now-lastPaint)/1000);lastPaint = now;
      for(const p of visible){p.time+=elapsed;p.pointer=p.pointer.map((x,i)=>x+(p.target[i]-x)*(1-Math.exp(-elapsed*4)));p.pose=rigs.sample(p.rig,p.time,p.pointer);if(p.node.dataset.poseTime!==undefined)p.pose=rigs.sample(p.rig,Number(p.node.dataset.poseTime),[0,0]);if(p.node.dataset.poseBlink!==undefined)p.pose.blink=Number(p.node.dataset.poseBlink);}
      const ready = visible.filter(p => {
        p.art ||= texture(p.node.dataset.liveArt);
        return p.art.ready && (gpu?p.art.texture:true) && ((!p.dirty && p.width) || measure(p));
      });
      if (ready.length && gpu) {
        const cellW = Math.max(...ready.map(p => p.width)), cellH = Math.max(...ready.map(p => p.height));
        const columns = Math.ceil(Math.sqrt(ready.length)), rows = Math.ceil(ready.length / columns);
        const width = cellW * columns, height = cellH * rows;
        if (atlas.width !== width || atlas.height !== height) {atlas.width = width; atlas.height = height;}
        gl.useProgram(program);
        ready.forEach((p, i) => {
          p.x = (i % columns) * cellW; p.y = Math.floor(i / columns) * cellH;
          gl.viewport(p.x, height-p.y-p.height, p.width, p.height);
          gl.bindTexture(gl.TEXTURE_2D, p.art.texture);
          gl.uniform4fv(uniforms.crop, p.crop);
          const r=p.rig,m=p.pose;
          gl.uniform4fv(uniforms.head,r.head);gl.uniform2fv(uniforms.neck,r.neck);
          gl.uniform4fv(uniforms.eye0,r.eyes[0].slice(0,4));gl.uniform4fv(uniforms.eye1,r.eyes[1].slice(0,4));gl.uniform2f(uniforms.eyeAngles,r.eyes[0][4],r.eyes[1][4]);
          gl.uniform4fv(uniforms.hair0,r.hair[0].slice(0,4));gl.uniform4fv(uniforms.hair1,r.hair[1].slice(0,4));
          gl.uniform3fv(uniforms.tip0,r.hair[0].slice(4));gl.uniform3fv(uniforms.tip1,r.hair[1].slice(4));
          gl.uniform4fv(uniforms.cloth0,r.cloth[0]);gl.uniform4fv(uniforms.cloth1,r.cloth[1]);
          gl.uniform4fv(uniforms.hand,r.orb?[r.orb[0],r.orb[1],.18,.12]:[r.neck[0]+.14,.45,.16,.13]);gl.uniform1f(uniforms.gesture,m.gesture);gl.uniform4f(uniforms.pose,m.angle,m.lean,m.headY,m.wind);gl.uniform3f(uniforms.motion,m.trail,m.time,m.blink);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        });
        for (const p of ready) {
          p.context.drawImage(atlas, p.x, p.y, p.width, p.height, 0, 0, p.width, p.height);
          decorate(p);p.node.dataset.renderer='webgl';p.node.classList.add('is-painted');
        }
      }else if(ready.length){
        for(const p of ready){const [x,y,w,h]=p.crop,img=p.art.image;p.context.drawImage(img,x*img.width,y*img.height,w*img.width,h*img.height,0,0,p.width,p.height);fallbackEyes(p);decorate(p);p.node.dataset.renderer='canvas2d';p.node.classList.add('is-painted');}
      }
    }
    frameId = requestAnimationFrame(paint);
  }

  function wake() {if (!frameId) frameId = requestAnimationFrame(paint);}
  const intersections = new IntersectionObserver(entries => {
    for (const entry of entries) {const p = portraits.get(entry.target); if (p) p.visible = entry.isIntersecting;}
    wake();
  });
  const sizes = new ResizeObserver(entries => {
    for (const entry of entries) {const p = portraits.get(entry.target); if (p) p.dirty = true;}
    wake();
  });

  function sync() {
    needsSync = false;
    for (const [node, p] of portraits) {
      if (node.isConnected) continue;
      intersections.unobserve(node); sizes.unobserve(node); portraits.delete(node);
      p.canvas.width = p.canvas.height = 1;
    }
    for (const node of document.querySelectorAll('.portrait[data-living]')) {
      if (portraits.has(node)) continue;
      const canvas = document.createElement('canvas');
      canvas.className = 'living-surface'; canvas.setAttribute('aria-hidden', 'true');
      const context = canvas.getContext('2d', {alpha:false});
      if (!context) continue;
      const rig=rigs.profiles[node.dataset.liveHero];if(!rig)continue;
      const phase=rig.seed%7;
      node.classList.add('living-portrait'); node.style.setProperty('--portrait-phase', `${-phase}s`);
      node.append(canvas);
      portraits.set(node, {node, canvas, context, rig, phase, time:phase, pointer:[0,0],target:[0,0],visible:false, dirty:true});
      intersections.observe(node); sizes.observe(node);
    }
  }

  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||reduced.matches)return;
    const host=event.target.closest('.hero-card,.detail-portrait,.reveal-card,.hero-illustration,.cinema-portrait');
    for(const p of portraits.values()){
      if(host?.contains(p.node)){const r=p.node.getBoundingClientRect();p.target=[Math.max(-1,Math.min(1,2*(event.clientX-r.left)/r.width-1)),Math.max(-1,Math.min(1,2*(event.clientY-r.top)/r.height-1))];}
      else p.target=[0,0];
    }
  },{passive:true});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget)for(const p of portraits.values())p.target=[0,0];},{passive:true});
  const changes = new MutationObserver(() => {needsSync = true; wake();});
  const main=document.getElementById('main');if(main)changes.observe(main, {childList:true, subtree:true});
  if(modal)changes.observe(modal, {childList:true, subtree:true, attributes:true, attributeFilter:['open']});
  document.addEventListener('visibilitychange', wake);
  reduced.addEventListener('change', wake);
  atlas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); unavailable = true; gl = null;
    for (const p of portraits.values()) p.node.classList.remove('is-painted');
    wake();
  });
  sync(); wake();
})();
