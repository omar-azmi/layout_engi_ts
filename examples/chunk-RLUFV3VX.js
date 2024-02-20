var Oe=Object.defineProperty,qe=(e,t,r)=>t in e?Oe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,Le=(e,t,r)=>(qe(e,typeof t!="symbol"?t+"":t,r),r),J=()=>{},Ue=e=>e.length===0,Tt=String.fromCharCode,{from:Ct,isArray:Nt,of:xt}=Array,{isInteger:Dt,MAX_VALUE:k,NEGATIVE_INFINITY:Ft,POSITIVE_INFINITY:Re}=Number,{assign:Pt,defineProperty:jt,entries:Ve,fromEntries:Ot,keys:qt,getPrototypeOf:Be,values:Lt}=Object,ze=Date.now,{iterator:Ut,toStringTag:Rt}=Symbol,D=setTimeout,K=clearTimeout,Ye=setInterval,Ge=clearInterval,Q=e=>Be(e).constructor,Xe=(e,...t)=>new(Q(e))(...t),F=e=>e.prototype,u=(e,t,...r)=>s=>e[t].bind(s,...r),W=(e,t,...r)=>e[t].bind(e,...r),P=F(Array),S=F(Map),E=F(Set),He=u(P,"pop"),Z=u(P,"push"),Je=u(P,"splice",0),j=u(E,"add"),$=u(E,"clear"),ee=u(E,"delete"),te=u(E,"has"),re=u(S,"clear"),O=u(S,"delete"),b=u(S,"get"),f=u(S,"set"),ke=(e,t=-k,r=k)=>e<t?t:e>r?r:e,se=(e,t)=>(e%t+t)%t,Ke=(e,t)=>e<t?e:t,A=(e,t)=>e>t?e:t,ie=Symbol("a rejection by a throttled function"),Qe=Symbol("a timeout by an awaited promiseTimeout function"),We=(e,t,r)=>{let s,i=()=>{};return(...n)=>(K(s),r!==void 0&&i(r),new Promise((c,p)=>{i=p,s=D(()=>c(t(...n)),e)}))},Ze=(e,t)=>{let r=0;return(...s)=>{let i=ze();return i-r>e?(r=i,t(...s)):ie}},$e=(e,t)=>new Promise((r,s)=>{D(t?s:r,e,Qe)}),ae=(e,t)=>e===t,le=(e,t)=>!1,et=e=>e===!1?le:e??ae,tt=e=>{let t=e.length**.5;return e.reduce((r,s)=>r+s*(s+t),0)},Vt=J,M=e=>{let{newId:t,getId:r,setId:s,addEdge:i}=e;return class{constructor(n,{name:c,equals:p}={}){let g=t();s(g,this),this.id=g,this.rid=g,this.name=c,this.value=n,this.equals=et(p)}get(n){return n&&i(this.id,n),this.value}set(n){let c=this.value;return!this.equals(c,this.value=typeof n=="function"?n(c):n)}run(n){return n?1:0}bindMethod(n){return W(this,n)}static create(...n){let c=new this(...n);return[c.id,c]}}},rt=e=>{let t=e.runId;return class extends e.getClass(M){constructor(r,s){super(r,s)}set(r){return super.set(r)?(t(this.id),!0):!1}static create(r,s){let i=new this(r,s);return[i.id,i.bindMethod("get"),i.bindMethod("set")]}}},st=e=>class extends e.getClass(M){constructor(t,r){super(r?.value,r),this.fn=t,r?.defer===!1&&this.get()}get(t){return this.rid&&(this.run(),this.rid=0),super.get(t)}run(t){return super.set(this.fn(this.rid))?1:0}static create(t,r){let s=new this(t,r);return[s.id,s.bindMethod("get")]}},it=e=>class extends e.getClass(M){constructor(t,r){super(r?.value,r),this.fn=t,this.dirty=1,r?.defer===!1&&this.get()}run(t){return this.dirty=1}get(t){return(this.rid||this.dirty)&&(super.set(this.fn(this.rid)),this.dirty=0,this.rid=0),super.get(t)}static create(t,r){let s=new this(t,r);return[s.id,s.bindMethod("get")]}},at=e=>{let t=e.runId;return class extends e.getClass(M){constructor(r,s){super(void 0,s),this.fn=r,s?.defer===!1&&this.set()}get(r){r&&(this.rid&&this.run(),super.get(r))}set(){return t(this.id)}run(r){let s=this.fn(this.rid)!==!1;return this.rid&&(this.rid=0),s?1:0}static create(r,s){let i=new this(r,s);return[i.id,i.bindMethod("get"),i.bindMethod("set")]}}},lt=class{addEdge;delEdge;newId;getId;setId;delId;runId;swapId;clearCache;addClass;getClass;batch;dynamic;constructor(){let e=0,t=0,r=new Map,s=new Map,i=b(r),n=b(s),c=f(r),p=f(s),g=O(r),me=O(s),T=new Map,U=b(T),fe=f(T),m=re(T),ve=a=>{let l=new Set,_=j(l),o=te(l),d=y=>{o(y)||(i(y)?.forEach(d),_(y))};return a.forEach(d),a.forEach(ee(l)),[...l,...a].reverse()},be=(...a)=>{let l=tt(a);return U(l)??(fe(l,ve(a))&&U(l))},C=new Map,h=b(C),N=f(C),we=O(C),I=new Set,R=j(I),Ie=ee(I),Se=$(I),x=new Set,Ee=j(x),Ae=te(x),Me=$(x),V=new Map,At=f(V),Mt=re(V),B=[],Te=Z(B),Ce=He(B),z=(...a)=>{Se(),Me(),a.forEach(R);let l=a.length,_=be(...a);for(let d of _){if(Ie(d)&&!Ae(d)){let y=Ne(d,l-- >0);y!==0&&i(d)?.forEach(y>=1?R:Ee)}if(I.size<=0)break}let o;for(;o=Ce();)h(o)?.postrun()},Ne=(a,l)=>{let _=l===!0,o=h(a),d=o?.run(_)??0;return d>=1&&o.postrun&&Te(a),d},Y=[],xe=Z(Y),De=Je(Y),G=()=>++t,X=()=>{--t<=0&&(t=0,z(...De()))},Fe=(a,...l)=>{G();let _=a(...l);return X(),_};this.addEdge=(a,l)=>{if(a+l<=0)return!1;let _=i(a)??(c(a,new Set)&&i(a));return _.has(l)?!1:(_.add(l),n(l)?.add(a)||p(l,new Set([a])),m(),!0)},this.delEdge=(a,l)=>i(a)?.delete(l)&&n(l)?.delete(a)?(m(),!0):!1,this.newId=()=>(m(),++e),this.getId=h,this.setId=N,this.delId=a=>{if(we(a)){let l=i(a),_=n(a);return l?.forEach(o=>{n(o)?.delete(a)}),_?.forEach(o=>{i(o)?.delete(a)}),l?.clear(),_?.clear(),g(a),me(a),m(),!0}return!1},this.swapId=(a,l)=>{let _=h(a),o=h(l);N(a,o),N(l,_),_&&(_.id=l,_.rid&&(_.rid=l)),o&&(o.id=a,o.rid&&(o.rid=a)),m()},this.clearCache=m,this.runId=a=>t<=0?(z(a),!0):(xe(a),!1);let H=new Map,Pe=b(H),je=f(H);this.addClass=a=>{let l=this.getClass(a);return W(l,"create")},this.getClass=a=>{let l=Pe(a);return l||(l=a(this),je(a,l),l)},this.batch={startBatching:G,endBatching:X,scopedBatching:Fe},this.dynamic={setValue:(a,l)=>{let _=h(a??0);_&&(_.value=l)},setEquals:(a,l)=>{let _=h(a??0);_&&(_.equals=l)},setFn:(a,l)=>{let _=h(a??0);_&&(_.fn=l)}}}},v=e=>{let t=e.length,r=e[0]?.length??0;return[t,r]},ne=e=>{let[t,r]=v(e),s=[];for(let i=0;i<r;i++)s[i]=[];for(let i=0;i<t;i++)for(let n=0;n<r;n++)s[n][i]=e[i][n];return s},q=(e,t,r,...s)=>{let[i,n]=v(e);return r??=A(i-t,0),e.splice(t,r,...s)},L=(e,t,r,...s)=>{let[i,n]=v(e),c=s.length>0?ne(s):Array(i).fill([]);return r??=A(n-t,0),ne(e.map((p,g)=>p.splice(t,r,...c[g])))},nt=(e,t)=>{let[r,s]=v(e);if(t=se(t,r===0?1:r),t===0)return e;let i=q(e,r-t,t);return q(e,0,0,...i),e},_t=(e,t)=>{let[r,s]=v(e);if(t=se(t,s===0?1:s),t===0)return e;let i=L(e,s-t,t);return L(e,0,0,...i),e},ot=e=>{let t=e.length,r=new(Q(e))(t+1).fill(0);for(let s=0;s<t;s++)r[s+1]=r[s]+e[s];return r},ct=Number.isFinite,{abs:_e,cos:dt,max:ut,sin:ht,random:oe}=Math,ce=e=>{let t=e.length,r=()=>oe()*t|0,s=(i,n)=>{let c=e[i];e[i]=e[n],e[n]=c};for(let i=0;i<t;i++)s(i,r());return e},pt=(e,t,r)=>{let s=typeof r=="function"?()=>Array(t).fill(void 0).map(r):()=>Array(t).fill(r);return Array(e).fill(void 0).map(s)},gt=function*(e){let t=e.length;for(;!Ue(e);)t>=e.length&&(t=0,ce(e)),t=A(t+((yield e[t])??1),0)},de=(e,t=!1)=>(typeof e=="string"&&(e=e==="start"?0:e==="end"?1:.5),t?1-e:e),yt=(e,t=!1)=>(e=Array.isArray(e)?e:[e],e.map(r=>de(r,t))),mt=(e,t,r)=>{if(!r)return{width:e,height:t};let s=_e(dt(r)),i=_e(ht(r));return{width:e*s+t*i,height:e*i+t*s}},ft=e=>{let t={px:0,pw:0,ph:0};for(let r of e.split("+")){let s=r.trim(),i=+s.slice(0,-2),n=s.slice(-2);t[n]+=i}return t},ue=e=>{if(typeof e=="object")return e;let t=Number(e);return ct(t)?{px:t}:ft(e)},vt=["px","pw","ph"],bt=e=>{let t=ue(e);return vt.map(r=>String(t[r]??0)+r).join(" + ")},w=new lt,wt=w.addClass(rt),he=w.addClass(st),It=w.addClass(it),Bt=w.addClass(at),pe=(...e)=>wt(...e).splice(1),ge=(...e)=>he(...e)[1],ye=(...e)=>It(...e)[1],St=e=>typeof e=="function"?[e,void 0]:pe(e),Et=class{comp;isDirty;setDirty;paused=!1;pauseReactivity(){this.paused=!0}resumeReactivity(){this.paused=!1}constructor(e){let[t,r]=pe(void 0,{equals:()=>this.paused});this.comp=e?ye:ge,this.isDirty=t,this.setDirty=r}};export{v as Array2DShape,Et as SignalingClass,ie as THROTTLE_REJECT,Le as __publicField,de as alignmentToNumber,mt as boundboxOfRotatedRect,ke as clamp,Xe as constructFrom,ye as createLazy,ge as createMemo,he as createMemoSignal,St as createStateIfPrimitive,ot as cumulativeSum,We as debounce,ae as default_equality,Ge as dom_clearInterval,K as dom_clearTimeout,Ye as dom_setInterval,D as dom_setTimeout,le as falsey_equality,ut as math_max,oe as math_random,A as max,Ke as min,pt as newArray2D,J as noop,Re as number_POSITIVE_INFINITY,Ve as object_entries,yt as parseAlignments,ue as parseLengthUnit,$e as promiseTimeout,nt as rotateArray2DMajor,_t as rotateArray2DMinor,ce as shuffleArray,gt as shuffledDeque,w as signalCtx,q as spliceArray2DMajor,L as spliceArray2DMinor,bt as stringifyLengthUnit,Ze as throttle};
