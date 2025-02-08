import{r as E}from"./index-D2GD3Ky5.js";import{r as It}from"./index-C4b4fDol.js";const Yt=["top","right","bottom","left"],X=Math.min,F=Math.max,st=Math.round,it=Math.floor,N=t=>({x:t,y:t}),qt={left:"right",right:"left",bottom:"top",top:"bottom"},Xt={start:"end",end:"start"};function gt(t,e,o){return F(t,X(e,o))}function I(t,e){return typeof t=="function"?t(e):t}function Y(t){return t.split("-")[0]}function Z(t){return t.split("-")[1]}function xt(t){return t==="x"?"y":"x"}function yt(t){return t==="y"?"height":"width"}function U(t){return["top","bottom"].includes(Y(t))?"y":"x"}function vt(t){return xt(U(t))}function Ut(t,e,o){o===void 0&&(o=!1);const n=Z(t),i=vt(t),r=yt(i);let s=i==="x"?n===(o?"end":"start")?"right":"left":n==="start"?"bottom":"top";return e.reference[r]>e.floating[r]&&(s=ct(s)),[s,ct(s)]}function Kt(t){const e=ct(t);return[pt(t),e,pt(e)]}function pt(t){return t.replace(/start|end/g,e=>Xt[e])}function Gt(t,e,o){const n=["left","right"],i=["right","left"],r=["top","bottom"],s=["bottom","top"];switch(t){case"top":case"bottom":return o?e?i:n:e?n:i;case"left":case"right":return e?r:s;default:return[]}}function Jt(t,e,o,n){const i=Z(t);let r=Gt(Y(t),o==="start",n);return i&&(r=r.map(s=>s+"-"+i),e&&(r=r.concat(r.map(pt)))),r}function ct(t){return t.replace(/left|right|bottom|top/g,e=>qt[e])}function Qt(t){return{top:0,right:0,bottom:0,left:0,...t}}function Ft(t){return typeof t!="number"?Qt(t):{top:t,right:t,bottom:t,left:t}}function lt(t){const{x:e,y:o,width:n,height:i}=t;return{width:n,height:i,top:o,left:e,right:e+n,bottom:o+i,x:e,y:o}}function Ct(t,e,o){let{reference:n,floating:i}=t;const r=U(e),s=vt(e),c=yt(s),a=Y(e),f=r==="y",l=n.x+n.width/2-i.width/2,u=n.y+n.height/2-i.height/2,m=n[c]/2-i[c]/2;let d;switch(a){case"top":d={x:l,y:n.y-i.height};break;case"bottom":d={x:l,y:n.y+n.height};break;case"right":d={x:n.x+n.width,y:u};break;case"left":d={x:n.x-i.width,y:u};break;default:d={x:n.x,y:n.y}}switch(Z(e)){case"start":d[s]-=m*(o&&f?-1:1);break;case"end":d[s]+=m*(o&&f?-1:1);break}return d}const Zt=async(t,e,o)=>{const{placement:n="bottom",strategy:i="absolute",middleware:r=[],platform:s}=o,c=r.filter(Boolean),a=await(s.isRTL==null?void 0:s.isRTL(e));let f=await s.getElementRects({reference:t,floating:e,strategy:i}),{x:l,y:u}=Ct(f,n,a),m=n,d={},h=0;for(let g=0;g<c.length;g++){const{name:p,fn:w}=c[g],{x:v,y,data:b,reset:x}=await w({x:l,y:u,initialPlacement:n,placement:m,strategy:i,middlewareData:d,rects:f,platform:s,elements:{reference:t,floating:e}});l=v??l,u=y??u,d={...d,[p]:{...d[p],...b}},x&&h<=50&&(h++,typeof x=="object"&&(x.placement&&(m=x.placement),x.rects&&(f=x.rects===!0?await s.getElementRects({reference:t,floating:e,strategy:i}):x.rects),{x:l,y:u}=Ct(f,m,a)),g=-1)}return{x:l,y:u,placement:m,strategy:i,middlewareData:d}};async function et(t,e){var o;e===void 0&&(e={});const{x:n,y:i,platform:r,rects:s,elements:c,strategy:a}=t,{boundary:f="clippingAncestors",rootBoundary:l="viewport",elementContext:u="floating",altBoundary:m=!1,padding:d=0}=I(e,t),h=Ft(d),p=c[m?u==="floating"?"reference":"floating":u],w=lt(await r.getClippingRect({element:(o=await(r.isElement==null?void 0:r.isElement(p)))==null||o?p:p.contextElement||await(r.getDocumentElement==null?void 0:r.getDocumentElement(c.floating)),boundary:f,rootBoundary:l,strategy:a})),v=u==="floating"?{x:n,y:i,width:s.floating.width,height:s.floating.height}:s.reference,y=await(r.getOffsetParent==null?void 0:r.getOffsetParent(c.floating)),b=await(r.isElement==null?void 0:r.isElement(y))?await(r.getScale==null?void 0:r.getScale(y))||{x:1,y:1}:{x:1,y:1},x=lt(r.convertOffsetParentRelativeRectToViewportRelativeRect?await r.convertOffsetParentRelativeRectToViewportRelativeRect({elements:c,rect:v,offsetParent:y,strategy:a}):v);return{top:(w.top-x.top+h.top)/b.y,bottom:(x.bottom-w.bottom+h.bottom)/b.y,left:(w.left-x.left+h.left)/b.x,right:(x.right-w.right+h.right)/b.x}}const te=t=>({name:"arrow",options:t,async fn(e){const{x:o,y:n,placement:i,rects:r,platform:s,elements:c,middlewareData:a}=e,{element:f,padding:l=0}=I(t,e)||{};if(f==null)return{};const u=Ft(l),m={x:o,y:n},d=vt(i),h=yt(d),g=await s.getDimensions(f),p=d==="y",w=p?"top":"left",v=p?"bottom":"right",y=p?"clientHeight":"clientWidth",b=r.reference[h]+r.reference[d]-m[d]-r.floating[h],x=m[d]-r.reference[d],R=await(s.getOffsetParent==null?void 0:s.getOffsetParent(f));let O=R?R[y]:0;(!O||!await(s.isElement==null?void 0:s.isElement(R)))&&(O=c.floating[y]||r.floating[h]);const D=b/2-x/2,$=O/2-g[h]/2-1,P=X(u[w],$),W=X(u[v],$),T=P,L=O-g[h]-W,C=O/2-g[h]/2+D,z=gt(T,C,L),S=!a.arrow&&Z(i)!=null&&C!==z&&r.reference[h]/2-(C<T?P:W)-g[h]/2<0,M=S?C<T?C-T:C-L:0;return{[d]:m[d]+M,data:{[d]:z,centerOffset:C-z-M,...S&&{alignmentOffset:M}},reset:S}}}),ee=function(t){return t===void 0&&(t={}),{name:"flip",options:t,async fn(e){var o,n;const{placement:i,middlewareData:r,rects:s,initialPlacement:c,platform:a,elements:f}=e,{mainAxis:l=!0,crossAxis:u=!0,fallbackPlacements:m,fallbackStrategy:d="bestFit",fallbackAxisSideDirection:h="none",flipAlignment:g=!0,...p}=I(t,e);if((o=r.arrow)!=null&&o.alignmentOffset)return{};const w=Y(i),v=U(c),y=Y(c)===c,b=await(a.isRTL==null?void 0:a.isRTL(f.floating)),x=m||(y||!g?[ct(c)]:Kt(c)),R=h!=="none";!m&&R&&x.push(...Jt(c,g,h,b));const O=[c,...x],D=await et(e,p),$=[];let P=((n=r.flip)==null?void 0:n.overflows)||[];if(l&&$.push(D[w]),u){const C=Ut(i,s,b);$.push(D[C[0]],D[C[1]])}if(P=[...P,{placement:i,overflows:$}],!$.every(C=>C<=0)){var W,T;const C=(((W=r.flip)==null?void 0:W.index)||0)+1,z=O[C];if(z)return{data:{index:C,overflows:P},reset:{placement:z}};let S=(T=P.filter(M=>M.overflows[0]<=0).sort((M,A)=>M.overflows[1]-A.overflows[1])[0])==null?void 0:T.placement;if(!S)switch(d){case"bestFit":{var L;const M=(L=P.filter(A=>{if(R){const k=U(A.placement);return k===v||k==="y"}return!0}).map(A=>[A.placement,A.overflows.filter(k=>k>0).reduce((k,q)=>k+q,0)]).sort((A,k)=>A[1]-k[1])[0])==null?void 0:L[0];M&&(S=M);break}case"initialPlacement":S=c;break}if(i!==S)return{reset:{placement:S}}}return{}}}};function Et(t,e){return{top:t.top-e.height,right:t.right-e.width,bottom:t.bottom-e.height,left:t.left-e.width}}function St(t){return Yt.some(e=>t[e]>=0)}const ne=function(t){return t===void 0&&(t={}),{name:"hide",options:t,async fn(e){const{rects:o}=e,{strategy:n="referenceHidden",...i}=I(t,e);switch(n){case"referenceHidden":{const r=await et(e,{...i,elementContext:"reference"}),s=Et(r,o.reference);return{data:{referenceHiddenOffsets:s,referenceHidden:St(s)}}}case"escaped":{const r=await et(e,{...i,altBoundary:!0}),s=Et(r,o.floating);return{data:{escapedOffsets:s,escaped:St(s)}}}default:return{}}}}};async function oe(t,e){const{placement:o,platform:n,elements:i}=t,r=await(n.isRTL==null?void 0:n.isRTL(i.floating)),s=Y(o),c=Z(o),a=U(o)==="y",f=["left","top"].includes(s)?-1:1,l=r&&a?-1:1,u=I(e,t);let{mainAxis:m,crossAxis:d,alignmentAxis:h}=typeof u=="number"?{mainAxis:u,crossAxis:0,alignmentAxis:null}:{mainAxis:u.mainAxis||0,crossAxis:u.crossAxis||0,alignmentAxis:u.alignmentAxis};return c&&typeof h=="number"&&(d=c==="end"?h*-1:h),a?{x:d*l,y:m*f}:{x:m*f,y:d*l}}const ie=function(t){return t===void 0&&(t=0),{name:"offset",options:t,async fn(e){var o,n;const{x:i,y:r,placement:s,middlewareData:c}=e,a=await oe(e,t);return s===((o=c.offset)==null?void 0:o.placement)&&(n=c.arrow)!=null&&n.alignmentOffset?{}:{x:i+a.x,y:r+a.y,data:{...a,placement:s}}}}},re=function(t){return t===void 0&&(t={}),{name:"shift",options:t,async fn(e){const{x:o,y:n,placement:i}=e,{mainAxis:r=!0,crossAxis:s=!1,limiter:c={fn:p=>{let{x:w,y:v}=p;return{x:w,y:v}}},...a}=I(t,e),f={x:o,y:n},l=await et(e,a),u=U(Y(i)),m=xt(u);let d=f[m],h=f[u];if(r){const p=m==="y"?"top":"left",w=m==="y"?"bottom":"right",v=d+l[p],y=d-l[w];d=gt(v,d,y)}if(s){const p=u==="y"?"top":"left",w=u==="y"?"bottom":"right",v=h+l[p],y=h-l[w];h=gt(v,h,y)}const g=c.fn({...e,[m]:d,[u]:h});return{...g,data:{x:g.x-o,y:g.y-n,enabled:{[m]:r,[u]:s}}}}}},se=function(t){return t===void 0&&(t={}),{options:t,fn(e){const{x:o,y:n,placement:i,rects:r,middlewareData:s}=e,{offset:c=0,mainAxis:a=!0,crossAxis:f=!0}=I(t,e),l={x:o,y:n},u=U(i),m=xt(u);let d=l[m],h=l[u];const g=I(c,e),p=typeof g=="number"?{mainAxis:g,crossAxis:0}:{mainAxis:0,crossAxis:0,...g};if(a){const y=m==="y"?"height":"width",b=r.reference[m]-r.floating[y]+p.mainAxis,x=r.reference[m]+r.reference[y]-p.mainAxis;d<b?d=b:d>x&&(d=x)}if(f){var w,v;const y=m==="y"?"width":"height",b=["top","left"].includes(Y(i)),x=r.reference[u]-r.floating[y]+(b&&((w=s.offset)==null?void 0:w[u])||0)+(b?0:p.crossAxis),R=r.reference[u]+r.reference[y]+(b?0:((v=s.offset)==null?void 0:v[u])||0)-(b?p.crossAxis:0);h<x?h=x:h>R&&(h=R)}return{[m]:d,[u]:h}}}},ce=function(t){return t===void 0&&(t={}),{name:"size",options:t,async fn(e){var o,n;const{placement:i,rects:r,platform:s,elements:c}=e,{apply:a=()=>{},...f}=I(t,e),l=await et(e,f),u=Y(i),m=Z(i),d=U(i)==="y",{width:h,height:g}=r.floating;let p,w;u==="top"||u==="bottom"?(p=u,w=m===(await(s.isRTL==null?void 0:s.isRTL(c.floating))?"start":"end")?"left":"right"):(w=u,p=m==="end"?"top":"bottom");const v=g-l.top-l.bottom,y=h-l.left-l.right,b=X(g-l[p],v),x=X(h-l[w],y),R=!e.middlewareData.shift;let O=b,D=x;if((o=e.middlewareData.shift)!=null&&o.enabled.x&&(D=y),(n=e.middlewareData.shift)!=null&&n.enabled.y&&(O=v),R&&!m){const P=F(l.left,0),W=F(l.right,0),T=F(l.top,0),L=F(l.bottom,0);d?D=h-2*(P!==0||W!==0?P+W:F(l.left,l.right)):O=g-2*(T!==0||L!==0?T+L:F(l.top,l.bottom))}await a({...e,availableWidth:D,availableHeight:O});const $=await s.getDimensions(c.floating);return h!==$.width||g!==$.height?{reset:{rects:!0}}:{}}}};function at(){return typeof window<"u"}function tt(t){return _t(t)?(t.nodeName||"").toLowerCase():"#document"}function _(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function j(t){var e;return(e=(_t(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function _t(t){return at()?t instanceof Node||t instanceof _(t).Node:!1}function B(t){return at()?t instanceof Element||t instanceof _(t).Element:!1}function V(t){return at()?t instanceof HTMLElement||t instanceof _(t).HTMLElement:!1}function Pt(t){return!at()||typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof _(t).ShadowRoot}function ot(t){const{overflow:e,overflowX:o,overflowY:n,display:i}=H(t);return/auto|scroll|overlay|hidden|clip/.test(e+n+o)&&!["inline","contents"].includes(i)}function le(t){return["table","td","th"].includes(tt(t))}function ut(t){return[":popover-open",":modal"].some(e=>{try{return t.matches(e)}catch{return!1}})}function bt(t){const e=At(),o=B(t)?H(t):t;return["transform","translate","scale","rotate","perspective"].some(n=>o[n]?o[n]!=="none":!1)||(o.containerType?o.containerType!=="normal":!1)||!e&&(o.backdropFilter?o.backdropFilter!=="none":!1)||!e&&(o.filter?o.filter!=="none":!1)||["transform","translate","scale","rotate","perspective","filter"].some(n=>(o.willChange||"").includes(n))||["paint","layout","strict","content"].some(n=>(o.contain||"").includes(n))}function fe(t){let e=K(t);for(;V(e)&&!Q(e);){if(bt(e))return e;if(ut(e))return null;e=K(e)}return null}function At(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function Q(t){return["html","body","#document"].includes(tt(t))}function H(t){return _(t).getComputedStyle(t)}function dt(t){return B(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.scrollX,scrollTop:t.scrollY}}function K(t){if(tt(t)==="html")return t;const e=t.assignedSlot||t.parentNode||Pt(t)&&t.host||j(t);return Pt(e)?e.host:e}function $t(t){const e=K(t);return Q(e)?t.ownerDocument?t.ownerDocument.body:t.body:V(e)&&ot(e)?e:$t(e)}function nt(t,e,o){var n;e===void 0&&(e=[]),o===void 0&&(o=!0);const i=$t(t),r=i===((n=t.ownerDocument)==null?void 0:n.body),s=_(i);if(r){const c=wt(s);return e.concat(s,s.visualViewport||[],ot(i)?i:[],c&&o?nt(c):[])}return e.concat(i,nt(i,[],o))}function wt(t){return t.parent&&Object.getPrototypeOf(t.parent)?t.frameElement:null}function Wt(t){const e=H(t);let o=parseFloat(e.width)||0,n=parseFloat(e.height)||0;const i=V(t),r=i?t.offsetWidth:o,s=i?t.offsetHeight:n,c=st(o)!==r||st(n)!==s;return c&&(o=r,n=s),{width:o,height:n,$:c}}function Ot(t){return B(t)?t:t.contextElement}function J(t){const e=Ot(t);if(!V(e))return N(1);const o=e.getBoundingClientRect(),{width:n,height:i,$:r}=Wt(e);let s=(r?st(o.width):o.width)/n,c=(r?st(o.height):o.height)/i;return(!s||!Number.isFinite(s))&&(s=1),(!c||!Number.isFinite(c))&&(c=1),{x:s,y:c}}const ae=N(0);function Bt(t){const e=_(t);return!At()||!e.visualViewport?ae:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function ue(t,e,o){return e===void 0&&(e=!1),!o||e&&o!==_(t)?!1:e}function G(t,e,o,n){e===void 0&&(e=!1),o===void 0&&(o=!1);const i=t.getBoundingClientRect(),r=Ot(t);let s=N(1);e&&(n?B(n)&&(s=J(n)):s=J(t));const c=ue(r,o,n)?Bt(r):N(0);let a=(i.left+c.x)/s.x,f=(i.top+c.y)/s.y,l=i.width/s.x,u=i.height/s.y;if(r){const m=_(r),d=n&&B(n)?_(n):n;let h=m,g=wt(h);for(;g&&n&&d!==h;){const p=J(g),w=g.getBoundingClientRect(),v=H(g),y=w.left+(g.clientLeft+parseFloat(v.paddingLeft))*p.x,b=w.top+(g.clientTop+parseFloat(v.paddingTop))*p.y;a*=p.x,f*=p.y,l*=p.x,u*=p.y,a+=y,f+=b,h=_(g),g=wt(h)}}return lt({width:l,height:u,x:a,y:f})}function Rt(t,e){const o=dt(t).scrollLeft;return e?e.left+o:G(j(t)).left+o}function Ht(t,e,o){o===void 0&&(o=!1);const n=t.getBoundingClientRect(),i=n.left+e.scrollLeft-(o?0:Rt(t,n)),r=n.top+e.scrollTop;return{x:i,y:r}}function de(t){let{elements:e,rect:o,offsetParent:n,strategy:i}=t;const r=i==="fixed",s=j(n),c=e?ut(e.floating):!1;if(n===s||c&&r)return o;let a={scrollLeft:0,scrollTop:0},f=N(1);const l=N(0),u=V(n);if((u||!u&&!r)&&((tt(n)!=="body"||ot(s))&&(a=dt(n)),V(n))){const d=G(n);f=J(n),l.x=d.x+n.clientLeft,l.y=d.y+n.clientTop}const m=s&&!u&&!r?Ht(s,a,!0):N(0);return{width:o.width*f.x,height:o.height*f.y,x:o.x*f.x-a.scrollLeft*f.x+l.x+m.x,y:o.y*f.y-a.scrollTop*f.y+l.y+m.y}}function me(t){return Array.from(t.getClientRects())}function he(t){const e=j(t),o=dt(t),n=t.ownerDocument.body,i=F(e.scrollWidth,e.clientWidth,n.scrollWidth,n.clientWidth),r=F(e.scrollHeight,e.clientHeight,n.scrollHeight,n.clientHeight);let s=-o.scrollLeft+Rt(t);const c=-o.scrollTop;return H(n).direction==="rtl"&&(s+=F(e.clientWidth,n.clientWidth)-i),{width:i,height:r,x:s,y:c}}function ge(t,e){const o=_(t),n=j(t),i=o.visualViewport;let r=n.clientWidth,s=n.clientHeight,c=0,a=0;if(i){r=i.width,s=i.height;const f=At();(!f||f&&e==="fixed")&&(c=i.offsetLeft,a=i.offsetTop)}return{width:r,height:s,x:c,y:a}}function pe(t,e){const o=G(t,!0,e==="fixed"),n=o.top+t.clientTop,i=o.left+t.clientLeft,r=V(t)?J(t):N(1),s=t.clientWidth*r.x,c=t.clientHeight*r.y,a=i*r.x,f=n*r.y;return{width:s,height:c,x:a,y:f}}function Dt(t,e,o){let n;if(e==="viewport")n=ge(t,o);else if(e==="document")n=he(j(t));else if(B(e))n=pe(e,o);else{const i=Bt(t);n={x:e.x-i.x,y:e.y-i.y,width:e.width,height:e.height}}return lt(n)}function Nt(t,e){const o=K(t);return o===e||!B(o)||Q(o)?!1:H(o).position==="fixed"||Nt(o,e)}function we(t,e){const o=e.get(t);if(o)return o;let n=nt(t,[],!1).filter(c=>B(c)&&tt(c)!=="body"),i=null;const r=H(t).position==="fixed";let s=r?K(t):t;for(;B(s)&&!Q(s);){const c=H(s),a=bt(s);!a&&c.position==="fixed"&&(i=null),(r?!a&&!i:!a&&c.position==="static"&&!!i&&["absolute","fixed"].includes(i.position)||ot(s)&&!a&&Nt(t,s))?n=n.filter(l=>l!==s):i=c,s=K(s)}return e.set(t,n),n}function xe(t){let{element:e,boundary:o,rootBoundary:n,strategy:i}=t;const s=[...o==="clippingAncestors"?ut(e)?[]:we(e,this._c):[].concat(o),n],c=s[0],a=s.reduce((f,l)=>{const u=Dt(e,l,i);return f.top=F(u.top,f.top),f.right=X(u.right,f.right),f.bottom=X(u.bottom,f.bottom),f.left=F(u.left,f.left),f},Dt(e,c,i));return{width:a.right-a.left,height:a.bottom-a.top,x:a.left,y:a.top}}function ye(t){const{width:e,height:o}=Wt(t);return{width:e,height:o}}function ve(t,e,o){const n=V(e),i=j(e),r=o==="fixed",s=G(t,!0,r,e);let c={scrollLeft:0,scrollTop:0};const a=N(0);if(n||!n&&!r)if((tt(e)!=="body"||ot(i))&&(c=dt(e)),n){const m=G(e,!0,r,e);a.x=m.x+e.clientLeft,a.y=m.y+e.clientTop}else i&&(a.x=Rt(i));const f=i&&!n&&!r?Ht(i,c):N(0),l=s.left+c.scrollLeft-a.x-f.x,u=s.top+c.scrollTop-a.y-f.y;return{x:l,y:u,width:s.width,height:s.height}}function mt(t){return H(t).position==="static"}function Lt(t,e){if(!V(t)||H(t).position==="fixed")return null;if(e)return e(t);let o=t.offsetParent;return j(t)===o&&(o=o.ownerDocument.body),o}function Vt(t,e){const o=_(t);if(ut(t))return o;if(!V(t)){let i=K(t);for(;i&&!Q(i);){if(B(i)&&!mt(i))return i;i=K(i)}return o}let n=Lt(t,e);for(;n&&le(n)&&mt(n);)n=Lt(n,e);return n&&Q(n)&&mt(n)&&!bt(n)?o:n||fe(t)||o}const be=async function(t){const e=this.getOffsetParent||Vt,o=this.getDimensions,n=await o(t.floating);return{reference:ve(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,width:n.width,height:n.height}}};function Ae(t){return H(t).direction==="rtl"}const Oe={convertOffsetParentRelativeRectToViewportRelativeRect:de,getDocumentElement:j,getClippingRect:xe,getOffsetParent:Vt,getElementRects:be,getClientRects:me,getDimensions:ye,getScale:J,isElement:B,isRTL:Ae};function jt(t,e){return t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height}function Re(t,e){let o=null,n;const i=j(t);function r(){var c;clearTimeout(n),(c=o)==null||c.disconnect(),o=null}function s(c,a){c===void 0&&(c=!1),a===void 0&&(a=1),r();const f=t.getBoundingClientRect(),{left:l,top:u,width:m,height:d}=f;if(c||e(),!m||!d)return;const h=it(u),g=it(i.clientWidth-(l+m)),p=it(i.clientHeight-(u+d)),w=it(l),y={rootMargin:-h+"px "+-g+"px "+-p+"px "+-w+"px",threshold:F(0,X(1,a))||1};let b=!0;function x(R){const O=R[0].intersectionRatio;if(O!==a){if(!b)return s();O?s(!1,O):n=setTimeout(()=>{s(!1,1e-7)},1e3)}O===1&&!jt(f,t.getBoundingClientRect())&&s(),b=!1}try{o=new IntersectionObserver(x,{...y,root:i.ownerDocument})}catch{o=new IntersectionObserver(x,y)}o.observe(t)}return s(!0),r}function _e(t,e,o,n){n===void 0&&(n={});const{ancestorScroll:i=!0,ancestorResize:r=!0,elementResize:s=typeof ResizeObserver=="function",layoutShift:c=typeof IntersectionObserver=="function",animationFrame:a=!1}=n,f=Ot(t),l=i||r?[...f?nt(f):[],...nt(e)]:[];l.forEach(w=>{i&&w.addEventListener("scroll",o,{passive:!0}),r&&w.addEventListener("resize",o)});const u=f&&c?Re(f,o):null;let m=-1,d=null;s&&(d=new ResizeObserver(w=>{let[v]=w;v&&v.target===f&&d&&(d.unobserve(e),cancelAnimationFrame(m),m=requestAnimationFrame(()=>{var y;(y=d)==null||y.observe(e)})),o()}),f&&!a&&d.observe(f),d.observe(e));let h,g=a?G(t):null;a&&p();function p(){const w=G(t);g&&!jt(g,w)&&o(),g=w,h=requestAnimationFrame(p)}return o(),()=>{var w;l.forEach(v=>{i&&v.removeEventListener("scroll",o),r&&v.removeEventListener("resize",o)}),u==null||u(),(w=d)==null||w.disconnect(),d=null,a&&cancelAnimationFrame(h)}}const Ce=ie,Ee=re,Se=ee,Pe=ce,De=ne,Tt=te,Le=se,Te=(t,e,o)=>{const n=new Map,i={platform:Oe,...o},r={...i.platform,_c:n};return Zt(t,e,{...i,platform:r})};var rt=typeof document<"u"?E.useLayoutEffect:E.useEffect;function ft(t,e){if(t===e)return!0;if(typeof t!=typeof e)return!1;if(typeof t=="function"&&t.toString()===e.toString())return!0;let o,n,i;if(t&&e&&typeof t=="object"){if(Array.isArray(t)){if(o=t.length,o!==e.length)return!1;for(n=o;n--!==0;)if(!ft(t[n],e[n]))return!1;return!0}if(i=Object.keys(t),o=i.length,o!==Object.keys(e).length)return!1;for(n=o;n--!==0;)if(!{}.hasOwnProperty.call(e,i[n]))return!1;for(n=o;n--!==0;){const r=i[n];if(!(r==="_owner"&&t.$$typeof)&&!ft(t[r],e[r]))return!1}return!0}return t!==t&&e!==e}function zt(t){return typeof window>"u"?1:(t.ownerDocument.defaultView||window).devicePixelRatio||1}function Mt(t,e){const o=zt(t);return Math.round(e*o)/o}function ht(t){const e=E.useRef(t);return rt(()=>{e.current=t}),e}function $e(t){t===void 0&&(t={});const{placement:e="bottom",strategy:o="absolute",middleware:n=[],platform:i,elements:{reference:r,floating:s}={},transform:c=!0,whileElementsMounted:a,open:f}=t,[l,u]=E.useState({x:0,y:0,strategy:o,placement:e,middlewareData:{},isPositioned:!1}),[m,d]=E.useState(n);ft(m,n)||d(n);const[h,g]=E.useState(null),[p,w]=E.useState(null),v=E.useCallback(A=>{A!==R.current&&(R.current=A,g(A))},[]),y=E.useCallback(A=>{A!==O.current&&(O.current=A,w(A))},[]),b=r||h,x=s||p,R=E.useRef(null),O=E.useRef(null),D=E.useRef(l),$=a!=null,P=ht(a),W=ht(i),T=ht(f),L=E.useCallback(()=>{if(!R.current||!O.current)return;const A={placement:e,strategy:o,middleware:m};W.current&&(A.platform=W.current),Te(R.current,O.current,A).then(k=>{const q={...k,isPositioned:T.current!==!1};C.current&&!ft(D.current,q)&&(D.current=q,It.flushSync(()=>{u(q)}))})},[m,e,o,W,T]);rt(()=>{f===!1&&D.current.isPositioned&&(D.current.isPositioned=!1,u(A=>({...A,isPositioned:!1})))},[f]);const C=E.useRef(!1);rt(()=>(C.current=!0,()=>{C.current=!1}),[]),rt(()=>{if(b&&(R.current=b),x&&(O.current=x),b&&x){if(P.current)return P.current(b,x,L);L()}},[b,x,L,P,$]);const z=E.useMemo(()=>({reference:R,floating:O,setReference:v,setFloating:y}),[v,y]),S=E.useMemo(()=>({reference:b,floating:x}),[b,x]),M=E.useMemo(()=>{const A={position:o,left:0,top:0};if(!S.floating)return A;const k=Mt(S.floating,l.x),q=Mt(S.floating,l.y);return c?{...A,transform:"translate("+k+"px, "+q+"px)",...zt(S.floating)>=1.5&&{willChange:"transform"}}:{position:o,left:k,top:q}},[o,c,S.floating,l.x,l.y]);return E.useMemo(()=>({...l,update:L,refs:z,elements:S,floatingStyles:M}),[l,L,z,S,M])}const Me=t=>{function e(o){return{}.hasOwnProperty.call(o,"current")}return{name:"arrow",options:t,fn(o){const{element:n,padding:i}=typeof t=="function"?t(o):t;return n&&e(n)?n.current!=null?Tt({element:n.current,padding:i}).fn(o):{}:n?Tt({element:n,padding:i}).fn(o):{}}}},We=(t,e)=>({...Ce(t),options:[t,e]}),Be=(t,e)=>({...Ee(t),options:[t,e]}),He=(t,e)=>({...Le(t),options:[t,e]}),Ne=(t,e)=>({...Se(t),options:[t,e]}),Ve=(t,e)=>({...Pe(t),options:[t,e]}),je=(t,e)=>({...De(t),options:[t,e]}),ze=(t,e)=>({...Me(t),options:[t,e]});var kt=function(){return kt=Object.assign||function(e){for(var o,n=1,i=arguments.length;n<i;n++){o=arguments[n];for(var r in o)Object.prototype.hasOwnProperty.call(o,r)&&(e[r]=o[r])}return e},kt.apply(this,arguments)};function Ie(t,e){var o={};for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.indexOf(n)<0&&(o[n]=t[n]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,n=Object.getOwnPropertySymbols(t);i<n.length;i++)e.indexOf(n[i])<0&&Object.prototype.propertyIsEnumerable.call(t,n[i])&&(o[n[i]]=t[n[i]]);return o}function Ye(t,e,o,n){function i(r){return r instanceof o?r:new o(function(s){s(r)})}return new(o||(o=Promise))(function(r,s){function c(l){try{f(n.next(l))}catch(u){s(u)}}function a(l){try{f(n.throw(l))}catch(u){s(u)}}function f(l){l.done?r(l.value):i(l.value).then(c,a)}f((n=n.apply(t,e||[])).next())})}function qe(t,e,o){if(o||arguments.length===2)for(var n=0,i=e.length,r;n<i;n++)(r||!(n in e))&&(r||(r=Array.prototype.slice.call(e,0,n)),r[n]=e[n]);return t.concat(r||Array.prototype.slice.call(e))}export{kt as _,Ve as a,ze as b,_e as c,Ie as d,qe as e,Ne as f,Ye as g,je as h,B as i,H as j,He as l,We as o,Be as s,$e as u};
