import{Grid as k}from"../chunk-R2BKI37H.js";import{THROTTLE_REJECT as E,createMemoSignal as v,default_equality as F,dom_clearTimeout as S,dom_setTimeout as b,falsey_equality as P,math_random as O,newArray2D as y,noop as X,promiseTimeout as Y,shuffleArray as $,signalCtx as p,throttle as j}from"../chunk-RLUFV3VX.js";var i={loading:1e3,throttle:200,trail:500,image_dir:"../assets/grid_images/",max_cols:7,col_offset:0,max_images:100},M=(t,l,e,o=X)=>{let s=e===!1?P:e??F,_=j(l,s),a;return(r,f)=>{S(a);let d=_(r,f);return d===E?(a=b(o,t),!0):d}},D=class extends k{pushCol(t=1){this.pauseReactivity();let l=i.max_cols,e=i.col_offset,o=e+this.cols,s=Math.min(i.max_images,o+t),_=Math.max(0,e,s-l),a=_-e;a>0&&(super.shiftCols(a),i.col_offset=_);let r=y(Math.min(l,t),n,()=>({}));super.pushCols(...r),this.resumeReactivity(),C(i.loading,[Math.max(_,o),s])}unshiftCol(t=1){this.pauseReactivity();let l=i.max_cols,e=i.col_offset,o=e+this.cols,s=Math.max(0,e-t),_=Math.min(o,s+l),a=o-_;a>0&&super.popCols(a),i.col_offset=s;let r=y(Math.min(l,t),n,()=>({}));super.unshiftCols(...r),this.resumeReactivity(),C(i.loading,[s,Math.min(_,e)])}popCol(t=1){let l=i.col_offset,e=l+this.cols,o=Math.max(0,e-t),s=Math.min(l,o);i.col_offset=s,super.popCols(t)}shiftCol(t=1){let l=i.col_offset,e=Math.max(0,l+t);i.col_offset=e,super.shiftCols(t)}},n=8,H=3,c=new D({rows:n,cols:H,originAlign:"right",colAlign:["end"],rowAlign:["center"],colGap:[30],rowGap:[30]}),R=[.1,.1,.25,1.5/4,.25,1.5/4,1.75/4,1.25/4],u,J=async(t,l)=>{let e=new Image,o=l%10;u[t][l]=e,e.onload=()=>{L(t,l,e)},e.src=i.image_dir+`${t},${o}.jpg`},C=async(t=0,l=void 0)=>{l??=[i.col_offset,i.col_offset+c.cols];let e=[],o=[],[s,_]=l;for(let a=s;a<_;a++)for(let r=0;r<n;r++)e.push([r,a]);$(e);for(let[a,r]of e)o.push(Y(O()*t).then(()=>J(a,r)));Promise.all(o)},T=async(t=0)=>(u=y(n,i.max_images),C(t,void 0)),L=(t,l,e)=>{let{width:o,height:s}=e;c.setCell(t,Math.max(0,(l-i.col_offset)%c.cols),{width:o*R[t],height:s*R[t]})},g=document.createElement("canvas"),h=g.getContext("2d");g.width=2e3,g.height=800;var[z,B]=v(t=>c.getCellFrames(t),{equals:M(i.trail,i.throttle,!1,()=>p.runId(q))}),K=(t,l)=>{p.dynamic.setEquals(z,M(t,l,!1,()=>p.runId(q)))},N=()=>{let t=c.getCellFrames();h.reset(),console.log("redraw");for(let l=0;l<c.cols;l++)for(let e=0;e<c.rows;e++){let{left:o,top:s,x:_,y:a,width:r,height:f}=t[e][l],d=u[e][l+i.col_offset];d&&h.drawImage(d,o+_,s+a,r,f)}},[q,Q]=v(t=>{let l=B(t);h.reset(),console.log("throttled-redraw");for(let e=0;e<c.cols;e++)for(let o=0;o<c.rows;o++){let{left:s,top:_,x:a,y:r,width:f,height:d}=l[o][e],m=u[o][e+i.col_offset];m&&h.drawImage(m,s+a,_+r,f,d)}},{equals:!1});g.onmousedown=t=>{let{offsetX:l,offsetY:e,currentTarget:o}=t,s=c.hit(l,e);if(s){let{left:_,top:a,x:r,y:f,width:d,height:m}=c.getCellFrame(...s),x=_+r,w=a+f,I=l>=x&&l<=x+d,A=e>=w&&e<=w+m;if(I&&A){let G=h.strokeStyle;h.strokeStyle="red",h.strokeRect(x,w,d,m),h.strokeStyle=G}}},document.body.appendChild(g),T(i.loading).then(()=>{Q()});export{i as app_config,c as grid,T as loadAllImages,N as redraw,p as signalCtx,K as updateThrottleGetCellFrames_equals};
