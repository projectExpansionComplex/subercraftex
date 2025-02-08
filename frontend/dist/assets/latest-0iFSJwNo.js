import{r as i,R as n,u as c,a as x,n as u,j as e}from"./index-D2GD3Ky5.js";import{A as h,m as f}from"./proxy-D4WD4cEd.js";function g({title:s,titleId:t,...l},a){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},l),s?i.createElement("title",{id:t},s):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6 18 18 6M6 6l12 12"}))}const m=i.forwardRef(g),p=(s,t,l)=>{i.useEffect(()=>{if(t>0){const a=setTimeout(()=>l(s),t);return()=>clearTimeout(a)}},[s,t,l])},b=n.memo(({notification:s,onDismiss:t})=>(p(s.id,s.duration,t),e.jsxs(f.div,{initial:{opacity:0,y:-50,x:50},animate:{opacity:1,y:0,x:0},exit:{opacity:0,y:-50,x:50},className:`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${s.type==="success"?"bg-green-50":s.type==="error"?"bg-red-50":"bg-blue-50"}`,children:[e.jsx("div",{className:"flex-1 w-0 p-4",children:e.jsx("div",{className:"flex items-start",children:e.jsx("div",{className:"ml-3 flex-1",children:e.jsx("p",{className:`text-sm font-medium ${s.type==="success"?"text-green-800":s.type==="error"?"text-red-800":"text-blue-800"}`,children:s.message})})})}),e.jsx("div",{className:"flex border-l border-gray-200",children:e.jsx("button",{onClick:()=>t(s.id),className:"w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",children:e.jsx(m,{className:"h-5 w-5","aria-hidden":"true"})})})]}))),j=n.memo(({notification:s,onDismiss:t})=>e.jsx("div",{className:"fixed z-50 inset-0 overflow-y-auto","aria-labelledby":"modal-title",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",children:[e.jsx("div",{className:"fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity","aria-hidden":"true"}),e.jsx("span",{className:"hidden sm:inline-block sm:align-middle sm:h-screen","aria-hidden":"true",children:"​"}),e.jsxs("div",{className:"inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full",children:[e.jsx("div",{className:"bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4",children:e.jsx("div",{className:"sm:flex sm:items-start",children:e.jsxs("div",{className:"mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left",children:[e.jsx("h3",{className:"text-lg leading-6 font-medium text-gray-900",id:"modal-title",children:s.title}),e.jsx("div",{className:"mt-2",children:e.jsx("p",{className:"text-sm text-gray-500",children:s.message})})]})})}),e.jsxs("div",{className:"bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",children:[s.action&&e.jsx("button",{type:"button",className:"w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm",onClick:()=>{s.action.handler(),t(s.id)},children:s.action.label}),e.jsx("button",{type:"button",className:"mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",onClick:()=>t(s.id),children:"Close"})]})]})]})})),y=n.memo(({notification:s,onDismiss:t})=>e.jsx("div",{className:"fixed top-0 inset-x-0 pb-2 sm:pb-5 z-50",children:e.jsx("div",{className:"max-w-7xl mx-auto px-2 sm:px-6 lg:px-8",children:e.jsx("div",{className:"p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3",children:e.jsxs("div",{className:"flex items-center justify-between flex-wrap",children:[e.jsx("div",{className:"w-0 flex-1 flex items-center",children:e.jsx("p",{className:"ml-3 font-medium text-white truncate",children:e.jsx("span",{className:"hidden md:inline",children:s.message})})}),s.action&&e.jsx("div",{className:"order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto",children:e.jsx("button",{onClick:()=>{s.action.handler(),t(s.id)},className:"flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50",children:s.action.label})}),e.jsx("div",{className:"order-2 flex-shrink-0 sm:order-3 sm:ml-2",children:e.jsxs("button",{type:"button",onClick:()=>t(s.id),className:"-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white",children:[e.jsx("span",{className:"sr-only",children:"Dismiss"}),e.jsx(m,{className:"h-6 w-6 text-white","aria-hidden":"true"})]})})]})})})})),N=()=>{const s=c(),t=x(r=>r.notifications.messages),l=i.useCallback(r=>{s(u(r))},[s]),a=i.useMemo(()=>t.filter(r=>r.type==="toast"),[t]),d=i.useMemo(()=>t.filter(r=>r.type==="modal"),[t]),o=i.useMemo(()=>t.filter(r=>r.type==="banner"),[t]);return e.jsxs(e.Fragment,{children:[e.jsx("div",{"aria-live":"assertive",className:"fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50",children:e.jsx("div",{className:"w-full flex flex-col items-center space-y-4 sm:items-end",children:e.jsx(h,{children:a.map(r=>e.jsx(b,{notification:r,onDismiss:l},r.id))})})}),d.map(r=>e.jsx(j,{notification:r,onDismiss:l},r.id)),o.map(r=>e.jsx(y,{notification:r,onDismiss:l},r.id))]})},k=n.memo(N);export{k as default};
