import{d as h,r as n}from"./index-DKe-Z_P2.js";import{a as b}from"./index-BsfGT_ux.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],y=h("Check",u);function g(r){const[d,e]=n.useState(void 0);return b(()=>{if(r){e({width:r.offsetWidth,height:r.offsetHeight});const c=new ResizeObserver(o=>{if(!Array.isArray(o)||!o.length)return;const f=o[0];let i,t;if("borderBoxSize"in f){const s=f.borderBoxSize,a=Array.isArray(s)?s[0]:s;i=a.inlineSize,t=a.blockSize}else i=r.offsetWidth,t=r.offsetHeight;e({width:i,height:t})});return c.observe(r,{box:"border-box"}),()=>c.unobserve(r)}else e(void 0)},[r]),d}export{y as C,g as u};
