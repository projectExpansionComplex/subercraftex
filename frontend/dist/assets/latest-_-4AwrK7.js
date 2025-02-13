import{r as t,a as g,j as e,L as l,c}from"./index-CN4mytNG.js";const n="https://subercraftex.com",F=()=>{const[r,u]=t.useState([]),[b,j]=t.useState({}),[f,N]=t.useState([]),[p,y]=t.useState([]),[v,w]=t.useState([]),[P,o]=t.useState(!0),[d,m]=t.useState(null),{current_user:x}=g(s=>s.auth),{theme:k,language:S}=g(s=>s.preferences);t.useEffect(()=>{(async()=>{o(!0),m(null);try{const[a,i,C,D,z]=await Promise.all([c.get("/api/featured-products"),c.get("/api/category-products"),c.get("/api/featured-designers"),c.get("/api/latest-blog-posts"),c.get("/api/trending-products")]);u(a.data),j(i.data),N(C.data),y(D.data),w(z.data)}catch(a){m("Failed to load homepage content. Please try again later."),console.error("Error fetching homepage content:",a)}finally{o(!1)}})()},[]);const[L,h]=t.useState(0),$=()=>{h(s=>(s+1)%r.length)},R=()=>{h(s=>s===0?r.length-1:s-1)};return P?e.jsx("div",{className:"flex justify-center items-center h-screen",children:e.jsx("div",{className:"animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"})}):d?e.jsx("div",{className:"flex justify-center items-center h-screen",children:e.jsx("div",{className:"text-red-500 text-xl",children:d})}):e.jsx(e.Fragment,{children:e.jsxs("div",{className:`homepage ${k} ${S}`,children:[e.jsx("section",{className:"hero-carousel mb-12",children:e.jsxs("div",{className:"relative",children:[r.map((s,a)=>e.jsxs("div",{className:`carousel-item ${a===L?"block":"hidden"}`,children:[console.log("this is carosel",s,a),e.jsx("img",{src:n+s.imageUrl,alt:s.name,className:"w-full h-96 object-cover",loading:"lazy"}),e.jsxs("div",{className:"absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4",children:[e.jsx("h2",{className:"text-2xl font-bold",children:s.name}),e.jsx("p",{className:"text-lg",children:s.description}),e.jsx(l,{to:`/product/${s._id}`,className:"mt-2 inline-block bg-white text-black px-4 py-2 rounded",children:"View Product"})]})]},s._id)),e.jsx("button",{className:"absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full",onClick:R,children:"<"}),e.jsx("button",{className:"absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full",onClick:$,children:">"})]})}),e.jsxs("section",{className:"category-grid mb-12",children:[e.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Shop by Category"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",children:Object.entries(b).map(([s,a])=>{var i;return e.jsx(l,{to:`/category/${s}`,className:"category-tile",children:e.jsxs("div",{className:"relative h-48 rounded overflow-hidden",children:[e.jsx("img",{src:n+((i=a[0])==null?void 0:i.thumbnail),alt:s,className:"w-full h-full object-cover",loading:"lazy"}),e.jsx("div",{className:"absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center",children:e.jsx("span",{className:"text-white text-xl font-bold",children:s})})]})},s)})})]}),e.jsxs("section",{className:"featured-designers mb-12",children:[e.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Featured Designers"}),e.jsx("div",{className:"flex overflow-x-auto space-x-4 pb-4",children:f.map(s=>e.jsx(l,{to:`/designer/${s.id}`,className:"flex-shrink-0",children:e.jsxs("div",{className:"w-48 text-center",children:[e.jsx("img",{src:s.avatar,alt:s.name,className:"w-32 h-32 rounded-full mx-auto mb-2",loading:"lazy"}),e.jsx("h3",{className:"font-semibold",children:s.name}),e.jsx("p",{className:"text-sm text-gray-600",children:s.specialty})]})},s.id))})]}),e.jsxs("section",{className:"latest-blog-posts mb-12",children:[e.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Latest from the Blog"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:p.map(s=>e.jsx(l,{to:`/blog/${s.id}`,className:"blog-post-card",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-md overflow-hidden",children:[e.jsx("img",{src:s.imageUrl,alt:s.title,className:"w-full h-48 object-cover",loading:"lazy"}),e.jsxs("div",{className:"p-4",children:[e.jsx("h3",{className:"font-bold text-xl mb-2",children:s.title}),e.jsx("p",{className:"text-gray-600 mb-2",children:s.excerpt}),e.jsxs("p",{className:"text-sm text-gray-500",children:["By ",s.author," on ",new Date(s.publishDate).toLocaleDateString()]})]})]})},s.id))})]}),e.jsxs("section",{className:"trending-products mb-12",children:[e.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Trending Now"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",children:v.map(s=>e.jsx(l,{to:`/product/${s._id}`,className:"product-card",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-md overflow-hidden",children:[e.jsx("img",{src:n+s.thumbnail,alt:s.name,className:"w-full h-48 object-cover",loading:"lazy"}),e.jsxs("div",{className:"p-4",children:[e.jsx("h3",{className:"font-semibold text-lg mb-2",style:{color:"black"},children:s.name}),e.jsxs("p",{className:"text-gray-800 font-bold",children:["$",s.price.toFixed(2)]})]})]})},s.id))})]}),e.jsx("section",{className:"sustainability-spotlight mb-12",children:e.jsxs("div",{className:"bg-green-100 p-6 rounded-lg",children:[e.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Sustainability Spotlight"}),e.jsx("p",{className:"mb-4",children:"Learn about our commitment to sustainable and ethical design practices."}),e.jsx(l,{to:"/sustainability",className:"bg-green-500 text-white px-4 py-2 rounded inline-block",children:"Explore Our Initiatives"})]})}),x&&e.jsxs("section",{className:"personalized-content mb-12",children:[e.jsx("h2",{className:"text-2xl font-bold mb-4",children:"Recommended for You"}),e.jsxs("p",{children:["Welcome back, ",x.full_name,"! Check out these items based on your interests."]})]})]})})};export{F as default};
