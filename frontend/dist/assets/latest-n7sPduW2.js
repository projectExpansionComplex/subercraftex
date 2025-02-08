import{r as t,a as S,h as c,j as s,L as C}from"./index-D2GD3Ky5.js";const D=()=>{const[n,d]=t.useState([]),[h,m]=t.useState([]),[x,g]=t.useState([]),[l,b]=t.useState("all"),[a,i]=t.useState(1),[u,j]=t.useState(1),{current_user:p}=S(e=>e.auth);t.useEffect(()=>{N(),f(),y()},[l,a]);const N=async()=>{try{const e=await c.get("http://localhost:1337/api/blog-posts",{params:{category:l!=="all"?l:void 0,page:a,limit:6}});d(e.data.data),j(Math.ceil(e.data.total_count/6))}catch(e){console.error("Error fetching blog posts:",e)}},f=async()=>{try{const e=await c.get("http://localhost:1337/api/designer-spotlights");m(e.data)}catch(e){console.error("Error fetching designer spotlights:",e)}},y=async()=>{try{const e=await c.get("http://localhost:1337/api/trend-reports");g(e.data)}catch(e){console.error("Error fetching trend reports:",e)}},v=e=>{b(e),i(1)},w=e=>{i(e)},o=(e,r)=>{console.log(`Sharing ${e} with ID: ${r}`)};return s.jsx(s.Fragment,{children:s.jsxs("div",{className:"container mx-auto px-4 py-8",children:[s.jsx("h1",{className:"text-4xl font-bold mb-8",children:"Design Inspiration"}),s.jsxs("div",{className:"mb-8",children:[s.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Explore by Category"}),s.jsx("div",{className:"flex flex-wrap gap-2",children:["all","interior","furniture","lighting","textiles"].map(e=>s.jsx("button",{onClick:()=>v(e),className:`px-4 py-2 rounded-full ${l===e?"bg-blue-500 text-white":"bg-gray-200 text-gray-800"}`,children:e.charAt(0).toUpperCase()+e.slice(1)},e))})]}),s.jsxs("section",{className:"mb-12",children:[s.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Latest Blog Posts"}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:n.map(e=>s.jsxs("div",{className:"bg-white rounded-lg shadow-md overflow-hidden",children:[s.jsx("img",{src:e.image_url,alt:e.title,className:"w-full h-48 object-cover",loading:"lazy"}),s.jsxs("div",{className:"p-4",children:[s.jsx("h3",{className:"text-xl font-semibold mb-2",children:e.title}),s.jsx("p",{className:"text-gray-600 mb-4",children:e.excerpt}),s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsxs("span",{className:"text-sm text-gray-500",children:["By ",e.author]}),s.jsx("button",{onClick:()=>o("blog",e.uid),className:"text-blue-500 hover:text-blue-700",children:"Share"})]})]})]},e.uid))}),s.jsx("div",{className:"mt-8 flex justify-center",children:Array.from({length:u},(e,r)=>r+1).map(e=>s.jsx("button",{onClick:()=>w(e),className:`mx-1 px-3 py-1 rounded ${a===e?"bg-blue-500 text-white":"bg-gray-200 text-gray-800"}`,children:e},e))})]}),s.jsxs("section",{className:"mb-12",children:[s.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Designer Spotlights"}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:h.map(e=>s.jsxs("div",{className:"bg-white rounded-lg shadow-md overflow-hidden",children:[s.jsx("img",{src:e.image_url,alt:e.name,className:"w-full h-48 object-cover",loading:"lazy"}),s.jsxs("div",{className:"p-4",children:[s.jsx("h3",{className:"text-xl font-semibold mb-2",children:e.name}),s.jsx("p",{className:"text-gray-600 mb-2",children:e.specialty}),s.jsx("p",{className:"text-sm text-gray-500 mb-4",children:e.bio}),s.jsx(C,{to:`/designer/${e.uid}`,className:"text-blue-500 hover:text-blue-700",children:"View Profile"})]})]},e.uid))})]}),s.jsxs("section",{className:"mb-12",children:[s.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Design Trend Reports"}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",children:x.map(e=>s.jsxs("div",{className:"bg-white rounded-lg shadow-md overflow-hidden",children:[s.jsx("img",{src:e.image_url,alt:e.title,className:"w-full h-48 object-cover",loading:"lazy"}),s.jsxs("div",{className:"p-4",children:[s.jsx("h3",{className:"text-xl font-semibold mb-2",children:e.title}),s.jsx("p",{className:"text-gray-600 mb-4",children:e.description}),s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsx("span",{className:"text-sm text-gray-500",children:new Date(e.created_at).toLocaleDateString()}),s.jsx("button",{onClick:()=>o("trend",e.uid),className:"text-blue-500 hover:text-blue-700",children:"Share"})]})]})]},e.uid))})]}),p&&s.jsxs("section",{className:"mb-12",children:[s.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Recommended for You"}),s.jsx("p",{className:"text-gray-600",children:"Based on your interests, we think you'll love these designs:"})]})]})})};export{D as default};
