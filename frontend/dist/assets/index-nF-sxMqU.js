import{r as i,j as b}from"./index-D2GD3Ky5.js";import{c as y}from"./index-B-o7OVwB.js";import{u as m,P,d as j}from"./index-DG9IbPYk.js";import{u as x}from"./utils-RBxwfoyS.js";function z(t,e=globalThis==null?void 0:globalThis.document){const n=m(t);i.useEffect(()=>{const r=s=>{s.key==="Escape"&&n(s)};return e.addEventListener("keydown",r,{capture:!0}),()=>e.removeEventListener("keydown",r,{capture:!0})},[n,e])}var M="DismissableLayer",p="dismissableLayer.update",V="dismissableLayer.pointerDownOutside",K="dismissableLayer.focusOutside",O,B=i.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),T=i.forwardRef((t,e)=>{const{disableOutsidePointerEvents:n=!1,onEscapeKeyDown:r,onPointerDownOutside:s,onFocusOutside:o,onInteractOutside:l,onDismiss:d,...v}=t,c=i.useContext(B),[u,A]=i.useState(null),f=(u==null?void 0:u.ownerDocument)??(globalThis==null?void 0:globalThis.document),[,F]=i.useState({}),k=x(e,a=>A(a)),D=Array.from(c.layers),[I]=[...c.layersWithOutsidePointerEventsDisabled].slice(-1),_=D.indexOf(I),L=u?D.indexOf(u):-1,H=c.layersWithOutsidePointerEventsDisabled.size>0,C=L>=_,U=Y(a=>{const E=a.target,g=[...c.branches].some(h=>h.contains(E));!C||g||(s==null||s(a),l==null||l(a),a.defaultPrevented||d==null||d())},f),w=$(a=>{const E=a.target;[...c.branches].some(h=>h.contains(E))||(o==null||o(a),l==null||l(a),a.defaultPrevented||d==null||d())},f);return z(a=>{L===c.layers.size-1&&(r==null||r(a),!a.defaultPrevented&&d&&(a.preventDefault(),d()))},f),i.useEffect(()=>{if(u)return n&&(c.layersWithOutsidePointerEventsDisabled.size===0&&(O=f.body.style.pointerEvents,f.body.style.pointerEvents="none"),c.layersWithOutsidePointerEventsDisabled.add(u)),c.layers.add(u),R(),()=>{n&&c.layersWithOutsidePointerEventsDisabled.size===1&&(f.body.style.pointerEvents=O)}},[u,f,n,c]),i.useEffect(()=>()=>{u&&(c.layers.delete(u),c.layersWithOutsidePointerEventsDisabled.delete(u),R())},[u,c]),i.useEffect(()=>{const a=()=>F({});return document.addEventListener(p,a),()=>document.removeEventListener(p,a)},[]),b.jsx(P.div,{...v,ref:k,style:{pointerEvents:H?C?"auto":"none":void 0,...t.style},onFocusCapture:y(t.onFocusCapture,w.onFocusCapture),onBlurCapture:y(t.onBlurCapture,w.onBlurCapture),onPointerDownCapture:y(t.onPointerDownCapture,U.onPointerDownCapture)})});T.displayName=M;var X="DismissableLayerBranch",S=i.forwardRef((t,e)=>{const n=i.useContext(B),r=i.useRef(null),s=x(e,r);return i.useEffect(()=>{const o=r.current;if(o)return n.branches.add(o),()=>{n.branches.delete(o)}},[n.branches]),b.jsx(P.div,{...t,ref:s})});S.displayName=X;function Y(t,e=globalThis==null?void 0:globalThis.document){const n=m(t),r=i.useRef(!1),s=i.useRef(()=>{});return i.useEffect(()=>{const o=d=>{if(d.target&&!r.current){let v=function(){N(V,n,c,{discrete:!0})};const c={originalEvent:d};d.pointerType==="touch"?(e.removeEventListener("click",s.current),s.current=v,e.addEventListener("click",s.current,{once:!0})):v()}else e.removeEventListener("click",s.current);r.current=!1},l=window.setTimeout(()=>{e.addEventListener("pointerdown",o)},0);return()=>{window.clearTimeout(l),e.removeEventListener("pointerdown",o),e.removeEventListener("click",s.current)}},[e,n]),{onPointerDownCapture:()=>r.current=!0}}function $(t,e=globalThis==null?void 0:globalThis.document){const n=m(t),r=i.useRef(!1);return i.useEffect(()=>{const s=o=>{o.target&&!r.current&&N(K,n,{originalEvent:o},{discrete:!1})};return e.addEventListener("focusin",s),()=>e.removeEventListener("focusin",s)},[e,n]),{onFocusCapture:()=>r.current=!0,onBlurCapture:()=>r.current=!1}}function R(){const t=new CustomEvent(p);document.dispatchEvent(t)}function N(t,e,n,{discrete:r}){const s=n.originalEvent.target,o=new CustomEvent(t,{bubbles:!1,cancelable:!0,detail:n});e&&s.addEventListener(t,e,{once:!0}),r?j(s,o):s.dispatchEvent(o)}var ee=T,te=S,q="VisuallyHidden",W=i.forwardRef((t,e)=>b.jsx(P.span,{...t,ref:e,style:{position:"absolute",border:0,width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",wordWrap:"normal",...t.style}}));W.displayName=q;var se=W;export{te as B,T as D,se as R,W as V,ee as a};
