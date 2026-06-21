import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidEther.css';

export default function LiquidEther({
  mouseForce = 20, cursorSize = 100, isViscous = false, viscous = 30,
  iterationsViscous = 32, iterationsPoisson = 32, dt = 0.014, BFECC = true,
  resolution = 0.5, isBounce = false,
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  style = {}, className = '',
  autoDemo = true, autoSpeed = 0.5, autoIntensity = 2.2,
  takeoverDuration = 0.25, autoResumeDelay = 1000, autoRampDuration = 0.6
}) {
  const mountRef = useRef(null);
  const webglRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const rafRef = useRef(null);
  const intersectionObserverRef = useRef(null);
  const isVisibleRef = useRef(true);
  const resizeRafRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops) {
      const arr = stops?.length ? (stops.length === 1 ? [stops[0], stops[0]] : stops) : ['#ffffff', '#ffffff'];
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i*4]=Math.round(c.r*255); data[i*4+1]=Math.round(c.g*255);
        data[i*4+2]=Math.round(c.b*255); data[i*4+3]=255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = tex.minFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false; tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0,0,0,0);

    const face_vert = `attribute vec3 position;uniform vec2 px;uniform vec2 boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 scale=1.0-boundarySpace*2.0;pos.xy=pos.xy*scale;uv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;
    const line_vert = `attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;
    const mouse_vert = `precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;
    const advection_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize;uniform vec2 px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(isBFECC==false){vec2 vel=texture2D(velocity,uv).xy;vec2 uv2=uv-vel*dt*ratio;vec2 newVel=texture2D(velocity,uv2).xy;gl_FragColor=vec4(newVel,0.0,0.0);}else{vec2 spot_new=uv;vec2 vel_old=texture2D(velocity,uv).xy;vec2 spot_old=spot_new-vel_old*dt*ratio;vec2 vel_new1=texture2D(velocity,spot_old).xy;vec2 spot_new2=spot_old+vel_new1*dt*ratio;vec2 error=spot_new2-spot_new;vec2 spot_new3=spot_new-error/2.0;vec2 vel_2=texture2D(velocity,spot_new3).xy;vec2 spot_old2=spot_new3-vel_2*dt*ratio;vec2 newVel2=texture2D(velocity,spot_old2).xy;gl_FragColor=vec4(newVel2,0.0,0.0);}}`;
    const color_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float lenv=clamp(length(vel),0.0,1.0);vec3 c=texture2D(palette,vec2(lenv,0.5)).rgb;vec3 outRGB=mix(bgColor.rgb,c,lenv);float outA=mix(bgColor.a,1.0,lenv);gl_FragColor=vec4(outRGB,outA);}`;
    const divergence_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.0)).x;float x1=texture2D(velocity,uv+vec2(px.x,0.0)).x;float y0=texture2D(velocity,uv-vec2(0.0,px.y)).y;float y1=texture2D(velocity,uv+vec2(0.0,px.y)).y;float divergence=(x1-x0+y1-y0)/2.0;gl_FragColor=vec4(divergence/dt);}`;
    const externalForce_frag = `precision highp float;uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;gl_FragColor=vec4(force*d,0.0,1.0);}`;
    const poisson_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.0,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*2.0,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*2.0)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*2.0)).r;float div=texture2D(divergence,uv).r;float newP=(p0+p1+p2+p3)/4.0-div;gl_FragColor=vec4(newP);}`;
    const pressure_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float step=1.0;float p0=texture2D(pressure,uv+vec2(px.x*step,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*step,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*step)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*step)).r;vec2 v=texture2D(velocity,uv).xy;vec2 gradP=vec2(p0-p1,p2-p3)*0.5;v=v-gradP*dt;gl_FragColor=vec4(v,0.0,1.0);}`;
    const viscous_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy;vec2 new0=texture2D(velocity_new,uv+vec2(px.x*2.0,0.0)).xy;vec2 new1=texture2D(velocity_new,uv-vec2(px.x*2.0,0.0)).xy;vec2 new2=texture2D(velocity_new,uv+vec2(0.0,px.y*2.0)).xy;vec2 new3=texture2D(velocity_new,uv-vec2(0.0,px.y*2.0)).xy;vec2 newv=4.0*old+v*dt*(new0+new1+new2+new3);newv/=4.0*(1.0+v*dt);gl_FragColor=vec4(newv,0.0,0.0);}`;

    // Common
    let width = 0, height = 0, renderer, clock;
    const container = mountRef.current;
    container.style.position = container.style.position || 'relative';
    container.style.overflow = 'hidden';

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const resizeCommon = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      if (renderer) renderer.setSize(width, height, false);
    };
    resizeCommon();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.autoClear = false;
    renderer.setClearColor(new THREE.Color(0), 0);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;';
    clock = new THREE.Clock(); clock.start();
    container.prepend(renderer.domElement);

    // Mouse
    const coords = new THREE.Vector2(), coords_old = new THREE.Vector2(), diff = new THREE.Vector2();
    let mouseMoved = false, mouseTimer = null, isHoverInside = false, hasUserControl = false;
    let isAutoActive = false, takeoverActive = false, takeoverStartTime = 0;
    const takeoverFrom = new THREE.Vector2(), takeoverTo = new THREE.Vector2();
    let lastUserInteraction = performance.now();

    const isPointInside = (cx, cy) => {
      const r = container.getBoundingClientRect();
      return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
    };
    const setCoords = (x, y) => {
      if (mouseTimer) clearTimeout(mouseTimer);
      const r = container.getBoundingClientRect();
      if (!r.width || !r.height) return;
      coords.set((x - r.left) / r.width * 2 - 1, -((y - r.top) / r.height * 2 - 1));
      mouseMoved = true;
      mouseTimer = setTimeout(() => { mouseMoved = false; }, 100);
    };
    const onMouseMove = e => {
      isHoverInside = isPointInside(e.clientX, e.clientY);
      if (!isHoverInside) return;
      lastUserInteraction = performance.now();
      if (isAutoActive && !hasUserControl && !takeoverActive) {
        const r = container.getBoundingClientRect();
        takeoverFrom.copy(coords);
        takeoverTo.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1));
        takeoverStartTime = performance.now();
        takeoverActive = true; hasUserControl = true; isAutoActive = false;
        return;
      }
      setCoords(e.clientX, e.clientY); hasUserControl = true;
    };
    const onTouchMove = e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      isHoverInside = isPointInside(t.clientX, t.clientY);
      if (!isHoverInside) return;
      lastUserInteraction = performance.now();
      setCoords(t.clientX, t.clientY);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Auto driver
    const autoCurrent = new THREE.Vector2(), autoTarget = new THREE.Vector2();
    let autoActive = false, autoLastTime = performance.now(), autoActivationTime = 0;
    const margin = 0.2, rampMs = autoRampDuration * 1000;
    const pickTarget = () => autoTarget.set((Math.random()*2-1)*(1-margin), (Math.random()*2-1)*(1-margin));
    pickTarget();
    const tmpDir = new THREE.Vector2();

    // FBO helper
    const fboOpts = () => ({
      type: /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType,
      depthBuffer: false, stencilBuffer: false,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping
    });
    const makeFBO = (w, h) => new THREE.WebGLRenderTarget(w, h, fboOpts());

    const simW = () => Math.max(1, Math.round(resolution * width));
    const simH = () => Math.max(1, Math.round(resolution * height));
    const cellScale = () => new THREE.Vector2(1/simW(), 1/simH());
    const fboSize = () => new THREE.Vector2(simW(), simH());

    let sw = simW(), sh = simH();
    const fbos = {};
    const fboKeys = ['vel_0','vel_1','vel_v0','vel_v1','div','p0','p1'];
    fboKeys.forEach(k => { fbos[k] = makeFBO(sw, sh); });

    const scene2 = new THREE.Scene(), cam2 = new THREE.Camera();
    const mkPass = (vert, frag, uniforms, output) => {
      const mat = new THREE.RawShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      const sc = new THREE.Scene(); sc.add(mesh);
      return { sc, mat, mesh, render: (tgt) => { renderer.setRenderTarget(tgt ?? null); renderer.render(sc, cam2); renderer.setRenderTarget(null); } };
    };

    const cs = cellScale(), fs = fboSize();
    const advPass = mkPass(face_vert, advection_frag, { boundarySpace:{value:cs}, px:{value:cs}, fboSize:{value:fs}, velocity:{value:fbos.vel_0.texture}, dt:{value:dt}, isBFECC:{value:BFECC} }, fbos.vel_1);
    const bndGeo = new THREE.BufferGeometry();
    bndGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]),3));
    const bndMesh = new THREE.LineSegments(bndGeo, new THREE.RawShaderMaterial({ vertexShader: line_vert, fragmentShader: advection_frag, uniforms: advPass.mat.uniforms }));
    advPass.sc.add(bndMesh);

    const mouseGeo = new THREE.PlaneGeometry(1,1);
    const mouseMat = new THREE.RawShaderMaterial({ vertexShader: mouse_vert, fragmentShader: externalForce_frag, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { px:{value:cs}, force:{value:new THREE.Vector2()}, center:{value:new THREE.Vector2()}, scale:{value:new THREE.Vector2(cursorSize,cursorSize)} } });
    const mouseMesh = new THREE.Mesh(mouseGeo, mouseMat);
    const extSc = new THREE.Scene(); extSc.add(mouseMesh);

    const viscPass = mkPass(face_vert, viscous_frag, { boundarySpace:{value:cs}, velocity:{value:fbos.vel_1.texture}, velocity_new:{value:fbos.vel_v0.texture}, v:{value:viscous}, px:{value:cs}, dt:{value:dt} });
    const divPass = mkPass(face_vert, divergence_frag, { boundarySpace:{value:cs}, velocity:{value:fbos.vel_1.texture}, px:{value:cs}, dt:{value:dt} }, fbos.div);
    const poisPass = mkPass(face_vert, poisson_frag, { boundarySpace:{value:cs}, pressure:{value:fbos.p0.texture}, divergence:{value:fbos.div.texture}, px:{value:cs} });
    const presPass = mkPass(face_vert, pressure_frag, { boundarySpace:{value:cs}, pressure:{value:fbos.p0.texture}, velocity:{value:fbos.vel_1.texture}, px:{value:cs}, dt:{value:dt} }, fbos.vel_0);
    const outMesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), new THREE.RawShaderMaterial({ vertexShader: face_vert, fragmentShader: color_frag, transparent:true, depthWrite:false, uniforms: { velocity:{value:fbos.vel_0.texture}, boundarySpace:{value:new THREE.Vector2()}, palette:{value:paletteTex}, bgColor:{value:bgVec4} } }));
    scene2.add(outMesh);

    const resizeSim = () => {
      sw = simW(); sh = simH();
      fboKeys.forEach(k => fbos[k].setSize(sw, sh));
      advPass.mat.uniforms.px.value = cellScale();
      advPass.mat.uniforms.fboSize.value = fboSize();
    };

    let running = false;
    const loop = () => {
      if (!running) return;
      // auto driver
      const now = performance.now();
      const idle = now - lastUserInteraction;
      if (autoDemo) {
        if (idle >= autoResumeDelay && !isHoverInside) {
          if (!autoActive) { autoActive=true; autoCurrent.copy(coords); autoLastTime=now; autoActivationTime=now; }
          isAutoActive = true;
          let dtA = (now - autoLastTime) / 1000; autoLastTime = now;
          if (dtA > 0.2) dtA = 0.016;
          const dir2 = tmpDir.subVectors(autoTarget, autoCurrent);
          const dist = dir2.length();
          if (dist < 0.01) { pickTarget(); } else {
            dir2.normalize();
            let ramp = rampMs > 0 ? Math.min(1,(now-autoActivationTime)/rampMs) : 1;
            ramp = ramp*ramp*(3-2*ramp);
            autoCurrent.addScaledVector(dir2, Math.min(autoSpeed * dtA * ramp, dist));
            coords.copy(autoCurrent);
          }
        } else if (idle < autoResumeDelay) { autoActive = false; isAutoActive = false; }
      }
      if (takeoverActive) {
        const t = (performance.now()-takeoverStartTime)/(takeoverDuration*1000);
        if (t >= 1) { takeoverActive=false; coords.copy(takeoverTo); coords_old.copy(coords); diff.set(0,0); }
        else { const k=t*t*(3-2*t); coords.copy(takeoverFrom).lerp(takeoverTo,k); }
      }
      diff.subVectors(coords, coords_old); coords_old.copy(coords);
      if (coords_old.x===0&&coords_old.y===0) diff.set(0,0);
      if (isAutoActive && !takeoverActive) diff.multiplyScalar(autoIntensity);

      // sim
      advPass.mat.uniforms.dt.value = dt;
      advPass.mat.uniforms.isBFECC.value = BFECC;
      bndMesh.visible = isBounce;
      advPass.render(fbos.vel_1);

      const cs2 = cellScale();
      const forceX = (diff.x/2)*mouseForce, forceY = (diff.y/2)*mouseForce;
      const csX = cursorSize*cs2.x, csY = cursorSize*cs2.y;
      mouseMat.uniforms.force.value.set(forceX, forceY);
      mouseMat.uniforms.center.value.set(Math.min(Math.max(coords.x,-1+csX+cs2.x*2),1-csX-cs2.x*2), Math.min(Math.max(coords.y,-1+csY+cs2.y*2),1-csY-cs2.y*2));
      mouseMat.uniforms.scale.value.set(cursorSize, cursorSize);
      renderer.setRenderTarget(fbos.vel_1); renderer.render(extSc, cam2); renderer.setRenderTarget(null);

      let vel = fbos.vel_1;
      if (isViscous) {
        viscPass.mat.uniforms.v.value = viscous; viscPass.mat.uniforms.dt.value = dt;
        let fin = fbos.vel_v0, fout = fbos.vel_v1;
        for (let i=0;i<iterationsViscous;i++) {
          viscPass.mat.uniforms.velocity_new.value = fin.texture;
          renderer.setRenderTarget(fout); renderer.render(viscPass.sc, cam2); renderer.setRenderTarget(null);
          [fin,fout]=[fout,fin];
        }
        vel = fin;
      }
      divPass.mat.uniforms.velocity.value = vel.texture; divPass.render(fbos.div);
      poisPass.mat.uniforms.divergence.value = fbos.div.texture;
      let pin=fbos.p0, pout=fbos.p1;
      for (let i=0;i<iterationsPoisson;i++) {
        poisPass.mat.uniforms.pressure.value = pin.texture;
        renderer.setRenderTarget(pout); renderer.render(poisPass.sc, cam2); renderer.setRenderTarget(null);
        [pin,pout]=[pout,pin];
      }
      presPass.mat.uniforms.velocity.value = vel.texture; presPass.mat.uniforms.pressure.value = pin.texture; presPass.render(fbos.vel_0);
      outMesh.material.uniforms.velocity.value = fbos.vel_0.texture;
      renderer.setRenderTarget(null); renderer.render(scene2, cam2);
      rafRef.current = requestAnimationFrame(loop);
    };

    const start = () => { if (running) return; running=true; loop(); };
    const pause = () => { running=false; if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current=null; } };
    start();

    const onResize = () => { resizeCommon(); resizeSim(); };
    const ro = new ResizeObserver(() => { if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current); resizeRafRef.current = requestAnimationFrame(onResize); });
    ro.observe(container); resizeObserverRef.current = ro;

    const io = new IntersectionObserver(entries => {
      const vis = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
      isVisibleRef.current = vis;
      if (vis && !document.hidden) start(); else pause();
    }, { threshold:[0,0.01,0.1] });
    io.observe(container); intersectionObserverRef.current = io;

    const onVis = () => { if (document.hidden) pause(); else if (isVisibleRef.current) start(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      pause();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect(); io.disconnect();
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      const canvas = renderer.domElement;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      renderer.dispose(); renderer.forceContextLoss();
    };
  }, []);

  return <div ref={mountRef} className={`liquid-ether-container ${className}`} style={style} />;
}
