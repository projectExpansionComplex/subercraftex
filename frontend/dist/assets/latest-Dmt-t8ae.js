import{u as P,a as p,r as o,h as c,C as k,b as l,j as t,L as m,D}from"./index-D2GD3Ky5.js";import{l as I}from"./lodash-cjLjRAtC.js";const R=()=>{const s=P(),n=p(e=>e.cart.items),h=p(e=>e.cart.total),{currency:b}=p(e=>e.preferences),[u,j]=o.useState(""),[i,f]=o.useState(0),[x,v]=o.useState(0),[g,N]=o.useState([]);o.useEffect(()=>{w(),S()},[]);const w=async()=>{try{const e=await c.get("http://localhost:1337/api/products/recently-viewed");N(e.data)}catch(e){console.error("Failed to fetch recently viewed items:",e)}},S=async()=>{try{const e=await c.post("http://localhost:1337/api/shipping/estimate",{items:n});v(e.data.estimated_cost)}catch(e){console.error("Failed to estimate shipping:",e)}},d=o.useCallback(I.debounce(async(e,a)=>{try{await c.put("http://localhost:1337/api/cart/update",{product_uid:e,quantity:a}),s(k({product_uid:e,quantity:a}))}catch(F){console.error("Failed to update quantity:",F),s(l({id:Date.now().toString(),type:"error",message:"Failed to update quantity. Please try again."}))}},300),[s]),y=async e=>{try{await c.delete(`http://localhost:1337/api/cart/item/${e}`),s(D(e))}catch(a){console.error("Failed to remove item:",a),s(l({id:Date.now().toString(),type:"error",message:"Failed to remove item. Please try again."}))}},C=async()=>{try{const e=await c.post("http://localhost:1337/api/promo/apply",{code:u});f(e.data.discount),s(l({id:Date.now().toString(),type:"success",message:"Promo code applied successfully!"}))}catch(e){console.error("Failed to apply promo code:",e),s(l({id:Date.now().toString(),type:"error",message:"Invalid promo code. Please try again."}))}},_=async e=>{try{await c.post("http://localhost:1337/api/wishlist/add",{product_uid:e}),await y(e),s(l({id:Date.now().toString(),type:"success",message:"Item saved for later."}))}catch(a){console.error("Failed to save item for later:",a),s(l({id:Date.now().toString(),type:"error",message:"Failed to save item for later. Please try again."}))}},r=e=>new Intl.NumberFormat("en-US",{style:"currency",currency:b}).format(e);return t.jsx(t.Fragment,{children:t.jsxs("div",{className:"container mx-auto px-4 py-8",children:[t.jsx("h1",{className:"text-3xl font-bold mb-8",children:"Your Shopping Cart"}),n.length===0?t.jsxs("div",{className:"text-center py-8",children:[t.jsx("p",{className:"text-xl mb-4",children:"Your cart is empty"}),t.jsx(m,{to:"/shop",className:"bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors",children:"Continue Shopping"})]}):t.jsxs("div",{className:"flex flex-col lg:flex-row gap-8",children:[t.jsx("div",{className:"lg:w-2/3",children:n.map(e=>t.jsxs("div",{className:"flex items-center border-b py-4",children:[t.jsx("img",{src:e.image,alt:e.name,className:"w-24 h-24 object-cover mr-4"}),t.jsxs("div",{className:"flex-grow",children:[t.jsx("h3",{className:"text-lg font-semibold",children:e.name}),t.jsx("p",{className:"text-gray-600",children:r(e.price)}),t.jsxs("div",{className:"flex items-center mt-2",children:[t.jsx("button",{onClick:()=>d(e.product_uid,Math.max(1,e.quantity-1)),className:"bg-gray-200 px-2 py-1 rounded-l",children:"-"}),t.jsx("input",{type:"number",value:e.quantity,onChange:a=>d(e.product_uid,parseInt(a.target.value)||1),className:"w-16 text-center border-t border-b"}),t.jsx("button",{onClick:()=>d(e.product_uid,e.quantity+1),className:"bg-gray-200 px-2 py-1 rounded-r",children:"+"})]})]}),t.jsxs("div",{className:"flex flex-col items-end",children:[t.jsx("button",{onClick:()=>y(e.product_uid),className:"text-red-500 hover:text-red-700",children:"Remove"}),t.jsx("button",{onClick:()=>_(e.product_uid),className:"text-blue-500 hover:text-blue-700 mt-2",children:"Save for Later"})]})]},e.product_uid))}),t.jsx("div",{className:"lg:w-1/3",children:t.jsxs("div",{className:"bg-gray-100 p-6 rounded",children:[t.jsx("h2",{className:"text-xl font-semibold mb-4",children:"Order Summary"}),t.jsxs("div",{className:"flex justify-between mb-2",children:[t.jsx("span",{children:"Subtotal"}),t.jsx("span",{children:r(h)})]}),t.jsxs("div",{className:"flex justify-between mb-2",children:[t.jsx("span",{children:"Estimated Shipping"}),t.jsx("span",{children:r(x)})]}),i>0&&t.jsxs("div",{className:"flex justify-between mb-2 text-green-600",children:[t.jsx("span",{children:"Promo Discount"}),t.jsxs("span",{children:["-",r(i)]})]}),t.jsxs("div",{className:"flex justify-between font-semibold text-lg mt-4",children:[t.jsx("span",{children:"Total"}),t.jsx("span",{children:r(h+x-i)})]}),t.jsxs("div",{className:"mt-6",children:[t.jsx("input",{type:"text",value:u,onChange:e=>j(e.target.value),placeholder:"Enter promo code",className:"w-full p-2 border rounded mb-2"}),t.jsx("button",{onClick:C,className:"w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors",children:"Apply Promo Code"})]}),t.jsx(m,{to:"/checkout",className:"block w-full bg-green-500 text-white text-center py-3 rounded mt-6 hover:bg-green-600 transition-colors",children:"Proceed to Checkout"})]})})]}),g.length>0&&t.jsxs("div",{className:"mt-12",children:[t.jsx("h2",{className:"text-2xl font-semibold mb-4",children:"Recently Viewed Items"}),t.jsx("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-4",children:g.map(e=>t.jsxs(m,{to:`/product/${e.uid}`,className:"block",children:[t.jsx("img",{src:e.image,alt:e.name,className:"w-full h-48 object-cover rounded"}),t.jsx("h3",{className:"mt-2 font-semibold",children:e.name}),t.jsx("p",{className:"text-gray-600",children:r(e.price)})]},e.uid))})]})]})})};export{R as default};
