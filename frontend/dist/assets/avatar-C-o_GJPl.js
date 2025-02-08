import{r as o,j as i}from"./index-D2GD3Ky5.js";import{c as h,P as c,u as I,a as g}from"./index-DG9IbPYk.js";import{c as f}from"./utils-RBxwfoyS.js";var m="Avatar",[j,T]=h(m),[C,p]=j(m),A=o.forwardRef((a,e)=>{const{__scopeAvatar:t,...r}=a,[n,s]=o.useState("idle");return i.jsx(C,{scope:t,imageLoadingStatus:n,onImageLoadingStatusChange:s,children:i.jsx(c.span,{...r,ref:e})})});A.displayName=m;var x="AvatarImage",w=o.forwardRef((a,e)=>{const{__scopeAvatar:t,src:r,onLoadingStatusChange:n=()=>{},...s}=a,d=p(x,t),l=b(r,s.referrerPolicy),u=I(v=>{n(v),d.onImageLoadingStatusChange(v)});return g(()=>{l!=="idle"&&u(l)},[l,u]),l==="loaded"?i.jsx(c.img,{...s,ref:e,src:r}):null});w.displayName=x;var S="AvatarFallback",N=o.forwardRef((a,e)=>{const{__scopeAvatar:t,delayMs:r,...n}=a,s=p(S,t),[d,l]=o.useState(r===void 0);return o.useEffect(()=>{if(r!==void 0){const u=window.setTimeout(()=>l(!0),r);return()=>window.clearTimeout(u)}},[r]),d&&s.imageLoadingStatus!=="loaded"?i.jsx(c.span,{...n,ref:e}):null});N.displayName=S;function b(a,e){const[t,r]=o.useState("idle");return g(()=>{if(!a){r("error");return}let n=!0;const s=new window.Image,d=l=>()=>{n&&r(l)};return r("loading"),s.onload=d("loaded"),s.onerror=d("error"),s.src=a,e&&(s.referrerPolicy=e),()=>{n=!1}},[a,e]),t}var L=A,y=w,R=N;const _=o.forwardRef(({className:a,...e},t)=>i.jsx(L,{ref:t,className:f("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",a),...e}));_.displayName=L.displayName;const k=o.forwardRef(({className:a,...e},t)=>i.jsx(y,{ref:t,className:f("aspect-square h-full w-full",a),...e}));k.displayName=y.displayName;const E=o.forwardRef(({className:a,...e},t)=>i.jsx(R,{ref:t,className:f("flex h-full w-full items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800",a),...e}));E.displayName=R.displayName;export{_ as A,k as a,E as b};
