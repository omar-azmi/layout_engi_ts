import{FrameSplit as _}from"../chunk-FRDZIFKF.js";import{__publicField as v,debounce as f,object_entries as b,parseLengthUnit as w,stringifyLengthUnit as g}from"../chunk-HECBX2TZ.js";var y=class{HTMLElement=document.createElement("table");tbody=this.HTMLElement.createTBody();constructor(){}bindTo(e){let n=b(e.set).filter(([i,a])=>a!==void 0).sort(([i],[a])=>+(i>a)*2-1),r=this.tbody;r.replaceChildren();for(let[i,a]of n){let c=e[i](),t=document.createElement("input"),s=r.insertRow();switch(s.insertCell().textContent=i,s.insertCell().appendChild(t),i){case"left":case"right":case"top":case"bottom":{t.value=String(c),t.oninput=()=>a(Number(t.value));break}case"height":case"width":{t.value=g(c),t.oninput=()=>a(w(t.value));break}case"margin":{t.value=JSON.stringify(c),t.oninput=()=>{try{a(JSON.parse(t.value))}catch{}};break}}}}},d=class extends _{static selectFrame(e){this.selected_instance=e}toPreview(e,n){super.toPreview(e,d.selected_instance===this?"red":n)}},p=d;v(p,"selected_instance");var l=new p(0,100,700,700),C=l.splitChildLeft({px:100,pw:.5}),m=l.splitChildRight({pw:.25}),x=l.splitChildBottom("300px + 0.25ph",{bottom:50});m.splitChildTop({px:-200/2,ph:.5}),m.splitChildTop(200);var h=new y,o=document.createElement("canvas"),u=o.getContext("2d"),F=f(50,e=>{let n=l.hit(e.offsetX,e.offsetY);p.selectFrame(n),n&&h.bindTo(n)});o.setAttribute("style","background-color: black;"),o.width=800,o.height=800,o.onpointerdown=F,document.body.appendChild(h.HTMLElement),document.body.appendChild(o);var T=()=>{u.clearRect(0,0,1e4,1e4),l.toPreview(u)},I=setInterval(requestAnimationFrame,1e3/15,T),k=!1,E,L,S;k&&setTimeout(()=>{let e=0,n=1,r=0,i=1,a=()=>{e+=14/3*n,e<0?n=1:e>400&&(n=-1),C.set.width({px:e,pw:.1,ph:0})},c=()=>{r+=10/3*i,r<0?i=1:r>600&&(i=-1),x.set.height({px:r,ph:.1})},t=()=>{l.set.left((s=0)=>s+1),l.set.right((s=0)=>s+1)};E=setInterval(requestAnimationFrame,6,a),L=setInterval(requestAnimationFrame,10,c),S=setInterval(requestAnimationFrame,50,t)},1e3);
