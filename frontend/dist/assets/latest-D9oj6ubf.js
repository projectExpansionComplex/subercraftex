import{u as x,a as m,r as o,j as e,L as r,h as u,b as d}from"./index-D2GD3Ky5.js";const s=a=>a,b=()=>{const a=x(),{language:g}=m(t=>t.preferences),[l,c]=o.useState(""),[i,n]=o.useState(!1),h=async t=>{if(t.preventDefault(),!!l){n(!0);try{await u.post("http://localhost:1337/api/newsletter/signup",{email:l}),a(d({id:Date.now().toString(),type:"success",message:s("newsletter_signup_success")})),c("")}catch{a(d({id:Date.now().toString(),type:"error",message:s("newsletter_signup_error")}))}finally{n(!1)}}};return e.jsx("footer",{className:"bg-gray-100 text-gray-600 py-12 px-4",children:e.jsxs("div",{className:"container mx-auto",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-lg mb-4",children:s("company")}),e.jsxs("ul",{className:"space-y-2",children:[e.jsx("li",{children:e.jsx(r,{to:"/about",className:"hover:text-gray-900",children:s("about_us")})}),e.jsx("li",{children:e.jsx(r,{to:"/careers",className:"hover:text-gray-900",children:s("careers")})}),e.jsx("li",{children:e.jsx(r,{to:"/press",className:"hover:text-gray-900",children:s("press")})})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-lg mb-4",children:s("customer_service")}),e.jsxs("ul",{className:"space-y-2",children:[e.jsx("li",{children:e.jsx(r,{to:"/contact",className:"hover:text-gray-900",children:s("contact")})}),e.jsx("li",{children:e.jsx(r,{to:"/faq",className:"hover:text-gray-900",children:s("faq")})}),e.jsx("li",{children:e.jsx(r,{to:"/returns",className:"hover:text-gray-900",children:s("returns_policy")})})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-lg mb-4",children:s("legal")}),e.jsxs("ul",{className:"space-y-2",children:[e.jsx("li",{children:e.jsx(r,{to:"/terms",className:"hover:text-gray-900",children:s("terms_of_service")})}),e.jsx("li",{children:e.jsx(r,{to:"/privacy",className:"hover:text-gray-900",children:s("privacy_policy")})})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-bold text-lg mb-4",children:s("newsletter_signup")}),e.jsxs("form",{onSubmit:h,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"newsletter-email",className:"sr-only",children:s("email_address")}),e.jsx("input",{type:"email",id:"newsletter-email",value:l,onChange:t=>c(t.target.value),placeholder:s("enter_your_email"),className:"w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500",required:!0})]}),e.jsx("button",{type:"submit",disabled:i,className:"w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out",children:s(i?"submitting":"subscribe")})]})]})]}),e.jsx("div",{className:"mt-12 pt-8 border-t border-gray-200",children:e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-center",children:[e.jsxs("div",{className:"flex space-x-6 mb-4 md:mb-0",children:[e.jsx("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer","aria-label":"Facebook",children:e.jsx("svg",{className:"h-6 w-6 fill-current text-gray-600 hover:text-gray-900",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"})})}),e.jsx("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer","aria-label":"Twitter",children:e.jsx("svg",{className:"h-6 w-6 fill-current text-gray-600 hover:text-gray-900",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"})})}),e.jsx("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer","aria-label":"Instagram",children:e.jsx("svg",{className:"h-6 w-6 fill-current text-gray-600 hover:text-gray-900",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"})})})]}),e.jsxs("div",{className:"text-sm",children:["© ",new Date().getFullYear()," SUBER-Craftex. ",s("all_rights_reserved")]})]})})]})})};export{b as default};
