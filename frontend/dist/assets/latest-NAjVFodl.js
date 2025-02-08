import{u as D,a as p,r as t,h as i,j as e,L as o,b as g}from"./index-D2GD3Ky5.js";const $=()=>{const m=D(),{current_user:c}=p(s=>s.auth),{language:O,currency:_}=p(s=>s.preferences),[n,j]=t.useState({totalRecycledMaterials:0,carbonFootprintReduction:0,waterSaved:0,communitiesSupported:0}),[N,y]=t.useState([]),[A,f]=t.useState([]),[h,v]=t.useState([]),[w,S]=t.useState([]),[l,R]=t.useState(null),[r,F]=t.useState(null),[I,x]=t.useState(!0),[u,C]=t.useState("");t.useEffect(()=>{E()},[]),t.useEffect(()=>{c&&b()},[c]);const E=async()=>{x(!0);try{const[s,a,d,P,M,k]=await Promise.all([i.get("http://localhost:1337/api/sustainability/metrics"),i.get("http://localhost:1337/api/sustainability/badges"),i.get("http://localhost:1337/api/sustainability/supply-chain"),i.get("http://localhost:1337/api/sustainability/artisan-stories"),i.get("http://localhost:1337/api/products?sustainability_score_min=8"),i.get("http://localhost:1337/api/sustainability/active-initiative")]);j(s.data),y(a.data),f(d.data),v(P.data),S(M.data),R(k.data)}catch(s){C("Failed to load sustainability data. Please try again later."),console.error("Error fetching sustainability data:",s)}finally{x(!1)}},b=async()=>{try{const s=await i.get(`http://localhost:1337/api/users/${c.uid}/sustainability-impact`);F(s.data)}catch(s){console.error("Error calculating personal impact:",s)}},L=async s=>{try{await i.post("http://localhost:1337/api/sustainability/pledges",s),m(g({id:Date.now().toString(),type:"success",message:"Thank you for your sustainability pledge!"}))}catch{m(g({id:Date.now().toString(),type:"error",message:"Failed to submit pledge. Please try again."}))}};return I?e.jsx("div",{className:"flex justify-center items-center h-screen",children:"Loading sustainability data..."}):u?e.jsx("div",{className:"text-red-500 text-center p-4",children:u}):e.jsx(e.Fragment,{children:e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsx("h1",{className:"text-4xl font-bold mb-8 text-center",children:"Sustainability Hub"}),e.jsxs("section",{className:"mb-12 bg-green-100 p-6 rounded-lg",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Our Sustainability Impact"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Recycled Materials"}),e.jsxs("p",{className:"text-2xl",children:[n.totalRecycledMaterials.toLocaleString()," kg"]})]}),e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Carbon Footprint Reduction"}),e.jsxs("p",{className:"text-2xl",children:[n.carbonFootprintReduction.toLocaleString()," kg CO2e"]})]}),e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Water Saved"}),e.jsxs("p",{className:"text-2xl",children:[n.waterSaved.toLocaleString()," liters"]})]}),e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Communities Supported"}),e.jsx("p",{className:"text-2xl",children:n.communitiesSupported.toLocaleString()})]})]})]}),e.jsxs("section",{className:"mb-12",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Our Sustainability Certifications"}),e.jsx("div",{className:"flex flex-wrap justify-center gap-4",children:N.map(s=>e.jsxs("div",{className:"bg-white p-4 rounded shadow text-center w-40",children:[e.jsx("img",{src:s.icon,alt:s.name,className:"w-16 h-16 mx-auto mb-2"}),e.jsx("h3",{className:"font-bold",children:s.name}),e.jsx("p",{className:"text-sm",children:s.description})]},s.id))})]}),e.jsxs("section",{className:"mb-12",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Our Ethical Supply Chain"}),e.jsx("div",{className:"bg-gray-100 p-4 rounded",children:e.jsx("p",{className:"text-center",children:"Interactive supply chain map will be displayed here"})})]}),e.jsxs("section",{className:"mb-12",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Artisan Stories"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:h.slice(0,3).map(s=>e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("img",{src:s.image,alt:s.name,className:"w-full h-48 object-cover mb-4 rounded"}),e.jsx("h3",{className:"font-bold text-lg",children:s.name}),e.jsx("p",{className:"text-sm text-gray-600 mb-2",children:s.location}),e.jsxs("p",{className:"text-sm mb-4",children:[s.story.substring(0,150),"..."]}),e.jsx(o,{to:`/artisan/${s.id}`,className:"text-blue-500 hover:underline",children:"Read more"})]},s.id))}),h.length>3&&e.jsx("div",{className:"text-center mt-4",children:e.jsx("button",{className:"bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",children:"Load More Stories"})})]}),e.jsxs("section",{className:"mb-12",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Shop Eco-Friendly"}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",children:w.slice(0,8).map(s=>e.jsxs(o,{to:`/product/${s.uid}`,className:"bg-white p-4 rounded shadow hover:shadow-lg transition-shadow",children:[e.jsx("img",{src:s.image,alt:s.name,className:"w-full h-48 object-cover mb-2 rounded"}),e.jsx("h3",{className:"font-bold",children:s.name}),e.jsxs("p",{className:"text-sm text-gray-600 mb-2",children:["Sustainability Score: ",s.sustainabilityScore,"/10"]}),e.jsx("div",{className:"flex flex-wrap gap-1",children:s.badges.map((a,d)=>e.jsx("span",{className:"bg-green-100 text-green-800 text-xs px-2 py-1 rounded",children:a},d))})]},s.uid))}),e.jsx("div",{className:"text-center mt-4",children:e.jsx(o,{to:"/shop?filter=eco-friendly",className:"bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600",children:"View All Eco-Friendly Products"})})]}),l&&e.jsxs("section",{className:"mb-12 bg-blue-100 p-6 rounded-lg",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Current Sustainability Initiative"}),e.jsx("h3",{className:"text-xl font-bold mb-2",children:l.title}),e.jsx("p",{className:"mb-4",children:l.description}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-bold mb-2",children:"Impact so far:"}),e.jsx("ul",{className:"list-disc list-inside",children:Object.entries(l.impact).map(([s,a])=>e.jsxs("li",{children:[s,": ",a]},s))})]}),e.jsx("div",{children:l.media&&l.media.length>0&&e.jsx("img",{src:l.media[0],alt:"Initiative visual",className:"w-full h-48 object-cover rounded"})})]})]}),c&&r&&e.jsxs("section",{className:"mb-12 bg-yellow-100 p-6 rounded-lg",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Your Sustainability Impact"}),e.jsx("p",{className:"mb-4",children:"Based on your purchases, here's how you've contributed to sustainability:"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Recycled Materials Used"}),e.jsxs("p",{className:"text-2xl",children:[r.recycledMaterials.toLocaleString()," kg"]})]}),e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Carbon Footprint Reduced"}),e.jsxs("p",{className:"text-2xl",children:[r.carbonFootprintReduced.toLocaleString()," kg CO2e"]})]}),e.jsxs("div",{className:"bg-white p-4 rounded shadow",children:[e.jsx("h3",{className:"font-bold",children:"Water Saved"}),e.jsxs("p",{className:"text-2xl",children:[r.waterSaved.toLocaleString()," liters"]})]})]}),e.jsx("button",{onClick:b,className:"mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600",children:"Recalculate Impact"})]}),e.jsxs("section",{className:"mb-12",children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Make a Sustainability Pledge"}),e.jsxs("form",{onSubmit:s=>{s.preventDefault();const a=new FormData(s.target);L(Object.fromEntries(a))},className:"bg-white p-6 rounded shadow",children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{htmlFor:"pledge",className:"block mb-2 font-bold",children:"Your Pledge:"}),e.jsx("textarea",{id:"pledge",name:"pledge",required:!0,className:"w-full p-2 border rounded",placeholder:"I pledge to..."})]}),e.jsx("div",{className:"mb-4",children:e.jsxs("label",{className:"block mb-2 font-bold",children:[e.jsx("input",{type:"checkbox",name:"newsletter",className:"mr-2"}),"Subscribe to sustainability newsletter"]})}),e.jsx("button",{type:"submit",className:"bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600",children:"Submit Pledge"})]})]})]})})};export{$ as default};
