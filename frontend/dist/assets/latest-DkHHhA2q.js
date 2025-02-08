import{u as M,a as v,r as c,h as n,b as o,j as e,L as N}from"./index-D2GD3Ky5.js";const W=()=>{const a=M(),{current_user:t,auth_token:i}=v(s=>s.auth),{theme:$}=v(s=>s.preferences),[l,h]=c.useState("overview"),[S,x]=c.useState(!1),[d,p]=c.useState(null),[b,D]=c.useState([]),[u,j]=c.useState([]),[g,w]=c.useState([]),[y,f]=c.useState([]),[A,C]=c.useState(!0);c.useEffect(()=>{t&&(k(),E(),F(),P(),B())},[t]);const k=async()=>{try{const s=await n.get(`http://localhost:1337/api/users/${t==null?void 0:t.uid}`,{headers:{Authorization:`Bearer ${i}`}});p(s.data),C(!1)}catch(s){console.error("Error fetching user profile:",s),a(o({id:Date.now().toString(),type:"error",message:"Failed to load user profile"}))}},E=async()=>{try{const s=await n.get(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/orders`,{headers:{Authorization:`Bearer ${i}`}});D(s.data)}catch(s){console.error("Error fetching order history:",s),a(o({id:Date.now().toString(),type:"error",message:"Failed to load order history"}))}},F=async()=>{try{const s=await n.get(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/addresses`,{headers:{Authorization:`Bearer ${i}`}});j(s.data)}catch(s){console.error("Error fetching saved addresses:",s),a(o({id:Date.now().toString(),type:"error",message:"Failed to load saved addresses"}))}},P=async()=>{try{const s=await n.get(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/payment-methods`,{headers:{Authorization:`Bearer ${i}`}});w(s.data)}catch(s){console.error("Error fetching payment methods:",s),a(o({id:Date.now().toString(),type:"error",message:"Failed to load payment methods"}))}},B=async()=>{try{const s=await n.get(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/wishlist`,{headers:{Authorization:`Bearer ${i}`}});f(s.data)}catch(s){console.error("Error fetching wishlist:",s),a(o({id:Date.now().toString(),type:"error",message:"Failed to load wishlist"}))}},U=async s=>{s.preventDefault();try{const r=await n.put(`http://localhost:1337/api/users/${t==null?void 0:t.uid}`,d,{headers:{Authorization:`Bearer ${i}`}});p(r.data),x(!1),a(o({id:Date.now().toString(),type:"success",message:"Profile updated successfully"}))}catch(r){console.error("Error updating profile:",r),a(o({id:Date.now().toString(),type:"error",message:"Failed to update profile"}))}},z=async s=>{try{await n.delete(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/addresses/${s}`,{headers:{Authorization:`Bearer ${i}`}}),j(u.filter(r=>r.id!==s)),a(o({id:Date.now().toString(),type:"success",message:"Address removed successfully"}))}catch(r){console.error("Error removing address:",r),a(o({id:Date.now().toString(),type:"error",message:"Failed to remove address"}))}},I=async s=>{try{await n.delete(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/payment-methods/${s}`,{headers:{Authorization:`Bearer ${i}`}}),w(g.filter(r=>r.id!==s)),a(o({id:Date.now().toString(),type:"success",message:"Payment method removed successfully"}))}catch(r){console.error("Error removing payment method:",r),a(o({id:Date.now().toString(),type:"error",message:"Failed to remove payment method"}))}},R=async s=>{try{await n.delete(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/wishlist/${s}`,{headers:{Authorization:`Bearer ${i}`}}),f(y.filter(r=>r.productId!==s)),a(o({id:Date.now().toString(),type:"success",message:"Item removed from wishlist"}))}catch(r){console.error("Error removing item from wishlist:",r),a(o({id:Date.now().toString(),type:"error",message:"Failed to remove item from wishlist"}))}},L=async()=>{try{const s=await n.get(`http://localhost:1337/api/users/${t==null?void 0:t.uid}/export`,{headers:{Authorization:`Bearer ${i}`},responseType:"blob"}),r=window.URL.createObjectURL(new Blob([s.data])),m=document.createElement("a");m.href=r,m.setAttribute("download","user_data.json"),document.body.appendChild(m),m.click(),m.remove(),a(o({id:Date.now().toString(),type:"success",message:"User data exported successfully"}))}catch(s){console.error("Error exporting user data:",s),a(o({id:Date.now().toString(),type:"error",message:"Failed to export user data"}))}};return A?e.jsx("div",{className:"flex justify-center items-center h-screen",children:"Loading..."}):e.jsxs("div",{className:`container mx-auto px-4 py-8 ${$==="dark"?"bg-gray-900 text-white":"bg-white text-gray-900"}`,children:[e.jsx("h1",{className:"text-3xl font-bold mb-8",children:"User Profile"}),e.jsxs("div",{className:"flex flex-wrap mb-6",children:[e.jsx("button",{className:`mr-4 mb-2 px-4 py-2 rounded ${l==="overview"?"bg-blue-500 text-white":"bg-gray-200 text-gray-700"}`,onClick:()=>h("overview"),children:"Overview"}),e.jsx("button",{className:`mr-4 mb-2 px-4 py-2 rounded ${l==="orders"?"bg-blue-500 text-white":"bg-gray-200 text-gray-700"}`,onClick:()=>h("orders"),children:"Orders"}),e.jsx("button",{className:`mr-4 mb-2 px-4 py-2 rounded ${l==="addresses"?"bg-blue-500 text-white":"bg-gray-200 text-gray-700"}`,onClick:()=>h("addresses"),children:"Addresses"}),e.jsx("button",{className:`mr-4 mb-2 px-4 py-2 rounded ${l==="payment"?"bg-blue-500 text-white":"bg-gray-200 text-gray-700"}`,onClick:()=>h("payment"),children:"Payment Methods"}),e.jsx("button",{className:`mr-4 mb-2 px-4 py-2 rounded ${l==="wishlist"?"bg-blue-500 text-white":"bg-gray-200 text-gray-700"}`,onClick:()=>h("wishlist"),children:"Wishlist"})]}),l==="overview"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Profile Information"}),S?e.jsxs("form",{onSubmit:U,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"fullName",className:"block mb-1",children:"Full Name"}),e.jsx("input",{type:"text",id:"fullName",value:d.fullName,onChange:s=>p({...d,fullName:s.target.value}),className:"w-full px-3 py-2 border rounded"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"email",className:"block mb-1",children:"Email"}),e.jsx("input",{type:"email",id:"email",value:d.email,onChange:s=>p({...d,email:s.target.value}),className:"w-full px-3 py-2 border rounded"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"bio",className:"block mb-1",children:"Bio"}),e.jsx("textarea",{id:"bio",value:d.bio,onChange:s=>p({...d,bio:s.target.value}),className:"w-full px-3 py-2 border rounded"})]}),e.jsxs("div",{className:"flex justify-end space-x-4",children:[e.jsx("button",{type:"button",onClick:()=>x(!1),className:"px-4 py-2 bg-gray-300 rounded",children:"Cancel"}),e.jsx("button",{type:"submit",className:"px-4 py-2 bg-blue-500 text-white rounded",children:"Save Changes"})]})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Full Name:"})," ",d.fullName]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Email:"})," ",d.email]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Bio:"})," ",d.bio]}),e.jsx("button",{onClick:()=>x(!0),className:"px-4 py-2 bg-blue-500 text-white rounded",children:"Edit Profile"})]})]}),l==="orders"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Order History"}),b.length>0?e.jsx("ul",{className:"space-y-4",children:b.map(s=>e.jsxs("li",{className:"border p-4 rounded",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Order ID:"})," ",s.orderId]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Date:"})," ",new Date(s.date).toLocaleDateString()]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Total:"})," $",s.total.toFixed(2)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Status:"})," ",s.status]}),e.jsx(N,{to:`/order/${s.orderId}`,className:"text-blue-500 hover:underline",children:"View Details"})]},s.orderId))}):e.jsx("p",{children:"No orders found."})]}),l==="addresses"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Saved Addresses"}),u.length>0?e.jsx("ul",{className:"space-y-4",children:u.map(s=>e.jsxs("li",{className:"border p-4 rounded",children:[e.jsx("p",{children:e.jsxs("strong",{children:[s.type==="billing"?"Billing":"Shipping"," Address"]})}),e.jsx("p",{children:s.streetAddress}),e.jsxs("p",{children:[s.city,", ",s.state," ",s.zipCode]}),e.jsx("p",{children:s.country}),e.jsx("button",{onClick:()=>z(s.id),className:"mt-2 px-3 py-1 bg-red-500 text-white rounded",children:"Remove"})]},s.id))}):e.jsx("p",{children:"No saved addresses."}),e.jsx("button",{onClick:()=>{},className:"mt-4 px-4 py-2 bg-blue-500 text-white rounded",children:"Add New Address"})]}),l==="payment"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Payment Methods"}),g.length>0?e.jsx("ul",{className:"space-y-4",children:g.map(s=>e.jsxs("li",{className:"border p-4 rounded",children:[e.jsx("p",{children:e.jsx("strong",{children:s.type==="credit_card"?"Credit Card":"PayPal"})}),s.type==="credit_card"&&e.jsxs("p",{children:["**** **** **** ",s.lastFour]}),s.type==="paypal"&&e.jsx("p",{children:s.email}),e.jsx("button",{onClick:()=>I(s.id),className:"mt-2 px-3 py-1 bg-red-500 text-white rounded",children:"Remove"})]},s.id))}):e.jsx("p",{children:"No saved payment methods."}),e.jsx("button",{onClick:()=>{},className:"mt-4 px-4 py-2 bg-blue-500 text-white rounded",children:"Add New Payment Method"})]}),l==="wishlist"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Wishlist"}),y.length>0?e.jsx("ul",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:y.map(s=>e.jsxs("li",{className:"border p-4 rounded",children:[e.jsx("img",{src:s.imageUrl,alt:s.name,className:"w-full h-48 object-cover mb-2"}),e.jsx("h3",{className:"font-semibold",children:s.name}),e.jsxs("p",{children:["$",s.price.toFixed(2)]}),e.jsxs("div",{className:"mt-2 space-x-2",children:[e.jsx(N,{to:`/product/${s.productId}`,className:"px-3 py-1 bg-blue-500 text-white rounded",children:"View Product"}),e.jsx("button",{onClick:()=>R(s.productId),className:"px-3 py-1 bg-red-500 text-white rounded",children:"Remove"})]})]},s.productId))}):e.jsx("p",{children:"Your wishlist is empty."})]}),e.jsxs("div",{className:"mt-8 space-y-4",children:[e.jsx("button",{onClick:()=>{},className:"w-full px-4 py-2 bg-green-500 text-white rounded",children:"Change Password"}),e.jsx("button",{onClick:L,className:"w-full px-4 py-2 bg-purple-500 text-white rounded",children:"Export User Data"})]})]})};export{W as default};
