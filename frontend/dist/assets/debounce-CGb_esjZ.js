import{b as X,c as z,d as J,r as F}from"./isObject-Duz1zIX0.js";var S,C;function K(){if(C)return S;C=1;var a=X(),i=z(),u="[object Symbol]";function n(m){return typeof m=="symbol"||i(m)&&a(m)==u}return S=n,S}var p,M;function Q(){if(M)return p;M=1;var a=J(),i=function(){return a.Date.now()};return p=i,p}var N,B;function V(){if(B)return N;B=1;var a=/\s/;function i(u){for(var n=u.length;n--&&a.test(u.charAt(n)););return n}return N=i,N}var O,D;function Y(){if(D)return O;D=1;var a=V(),i=/^\s+/;function u(n){return n&&n.slice(0,a(n)+1).replace(i,"")}return O=u,O}var R,$;function Z(){if($)return R;$=1;var a=Y(),i=F(),u=K(),n=NaN,m=/^[-+]0x[0-9a-f]+$/i,x=/^0b[01]+$/i,y=/^0o[0-7]+$/i,I=parseInt;function f(e){if(typeof e=="number")return e;if(u(e))return n;if(i(e)){var o=typeof e.valueOf=="function"?e.valueOf():e;e=i(o)?o+"":o}if(typeof e!="string")return e===0?e:+e;e=a(e);var s=x.test(e);return s||y.test(e)?I(e.slice(2),s?2:8):m.test(e)?n:+e}return R=f,R}var k,w;function re(){if(w)return k;w=1;var a=F(),i=Q(),u=Z(),n="Expected a function",m=Math.max,x=Math.min;function y(I,f,e){var o,s,g,b,t,c,v=0,j=!1,l=!1,q=!0;if(typeof I!="function")throw new TypeError(n);f=u(f)||0,a(e)&&(j=!!e.leading,l="maxWait"in e,g=l?m(u(e.maxWait)||0,f):g,q="trailing"in e?!!e.trailing:q);function _(r){var d=o,T=s;return o=s=void 0,v=r,b=I.apply(T,d),b}function G(r){return v=r,t=setTimeout(h,f),j?_(r):b}function H(r){var d=r-c,T=r-v,A=f-d;return l?x(A,g-T):A}function L(r){var d=r-c,T=r-v;return c===void 0||d>=f||d<0||l&&T>=g}function h(){var r=i();if(L(r))return W(r);t=setTimeout(h,H(r))}function W(r){return t=void 0,q&&o?_(r):(o=s=void 0,b)}function P(){t!==void 0&&clearTimeout(t),v=0,o=c=s=t=void 0}function U(){return t===void 0?b:W(i())}function E(){var r=i(),d=L(r);if(o=arguments,s=this,c=r,d){if(t===void 0)return G(c);if(l)return clearTimeout(t),t=setTimeout(h,f),_(c)}return t===void 0&&(t=setTimeout(h,f)),b}return E.cancel=P,E.flush=U,E}return k=y,k}export{Z as a,re as b,K as r};
