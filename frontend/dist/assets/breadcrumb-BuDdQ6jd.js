import{r as t,j as s}from"./index-D2GD3Ky5.js";import{c as m,S as c}from"./utils-RBxwfoyS.js";import{C as d}from"./chevron-right-Cttd4OkI.js";const l=t.forwardRef(({...a},r)=>s.jsx("nav",{ref:r,"aria-label":"breadcrumb",...a}));l.displayName="Breadcrumb";const i=t.forwardRef(({className:a,...r},e)=>s.jsx("ol",{ref:e,className:m("flex flex-wrap items-center gap-1.5 break-words text-sm text-neutral-500 sm:gap-2.5 dark:text-neutral-400",a),...r}));i.displayName="BreadcrumbList";const u=t.forwardRef(({className:a,...r},e)=>s.jsx("li",{ref:e,className:m("inline-flex items-center gap-1.5",a),...r}));u.displayName="BreadcrumbItem";const p=t.forwardRef(({asChild:a,className:r,...e},o)=>{const n=a?c:"a";return s.jsx(n,{ref:o,className:m("transition-colors hover:text-neutral-950 dark:hover:text-neutral-50",r),...e})});p.displayName="BreadcrumbLink";const x=t.forwardRef(({className:a,...r},e)=>s.jsx("span",{ref:e,role:"link","aria-disabled":"true","aria-current":"page",className:m("font-normal text-neutral-950 dark:text-neutral-50",a),...r}));x.displayName="BreadcrumbPage";const b=({children:a,className:r,...e})=>s.jsx("li",{role:"presentation","aria-hidden":"true",className:m("[&>svg]:size-3.5",r),...e,children:a??s.jsx(d,{})});b.displayName="BreadcrumbSeparator";export{l as B,i as a,u as b,p as c,b as d,x as e};
