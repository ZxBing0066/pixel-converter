(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function r(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerpolicy&&(a.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?a.credentials="include":n.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=r(n);fetch(n.href,a)}})();var V=function(){var t=document.getSelection();if(!t.rangeCount)return function(){};for(var e=document.activeElement,r=[],o=0;o<t.rangeCount;o++)r.push(t.getRangeAt(o));switch(e.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":e.blur();break;default:e=null;break}return t.removeAllRanges(),function(){t.type==="Caret"&&t.removeAllRanges(),t.rangeCount||r.forEach(function(n){t.addRange(n)}),e&&e.focus()}},Y=V,T={"text/plain":"Text","text/html":"Url",default:"Text"},Z="Copy to clipboard: #{key}, Enter";function _(t){var e=(/mac os x/i.test(navigator.userAgent)?"\u2318":"Ctrl")+"+C";return t.replace(/#{\s*key\s*}/g,e)}function ee(t,e){var r,o,n,a,c,s,f=!1;e||(e={}),r=e.debug||!1;try{n=Y(),a=document.createRange(),c=document.getSelection(),s=document.createElement("span"),s.textContent=t,s.ariaHidden="true",s.style.all="unset",s.style.position="fixed",s.style.top=0,s.style.clip="rect(0, 0, 0, 0)",s.style.whiteSpace="pre",s.style.webkitUserSelect="text",s.style.MozUserSelect="text",s.style.msUserSelect="text",s.style.userSelect="text",s.addEventListener("copy",function(i){if(i.stopPropagation(),e.format)if(i.preventDefault(),typeof i.clipboardData>"u"){r&&console.warn("unable to use e.clipboardData"),r&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var I=T[e.format]||T.default;window.clipboardData.setData(I,t)}else i.clipboardData.clearData(),i.clipboardData.setData(e.format,t);e.onCopy&&(i.preventDefault(),e.onCopy(i.clipboardData))}),document.body.appendChild(s),a.selectNodeContents(s),c.addRange(a);var b=document.execCommand("copy");if(!b)throw new Error("copy command was unsuccessful");f=!0}catch(i){r&&console.error("unable to copy using execCommand: ",i),r&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(e.format||"text",t),e.onCopy&&e.onCopy(window.clipboardData),f=!0}catch(I){r&&console.error("unable to copy using clipboardData: ",I),r&&console.error("falling back to prompt"),o=_("message"in e?e.message:Z),window.prompt(o,t)}}finally{c&&(typeof c.removeRange=="function"?c.removeRange(a):c.removeAllRanges()),s&&document.body.removeChild(s),n()}return f}var te=ee,ne=function(t){return Math.floor(Math.random()*t)};function ae(t,e){var r=typeof t=="string",o;r?e!=null&&e.fix?o=Array.from(t):o=t.split(""):(e==null?void 0:e.pure)===!1?o=t:o=t.slice();for(var n=o.length;n;){var a=ne(n--),c=o[a];o[a]=o[n],o[n]=c}return r?o.join(""):o}const l=document.getElementById("image"),S=document.getElementById("canvas"),p=document.getElementById("offscreen"),E=document.getElementById("file"),d=document.getElementById("shadow-image"),z=document.getElementById("precision"),F=document.getElementById("shadow-gap"),U=document.getElementById("shadow-radius"),W=document.getElementById("drop-transparent"),P=document.getElementById("drop-white"),N=document.getElementById("drop-alpha"),H=document.getElementById("random-shadow"),j=document.getElementById("text-shadow"),q=document.getElementById("shadow-text"),G=document.getElementById("shadow-text-size"),oe=document.getElementById("export"),re=document.getElementById("text-shadow-style"),y=S.getContext("2d"),K=p.getContext("2d");let X,h=640,u=50,w=0,D=0,k=!0,L=!1,C=!1,B=!1,x=!1,v="@",M=1,m={};z.value=u+"";F.value=w+"";U.value=D+"";W.checked=k;P.checked=C;N.checked=L;H.checked=B;j.checked=x;q.value=v;G.value=M+"";var O;(O=document.getElementById("initial"))==null||O.addEventListener("click",()=>{E.click()});var A;(A=document.querySelector(".card-image"))==null||A.addEventListener("click",()=>{E.click()});var $;($=document.querySelector("#import"))==null||$.addEventListener("click",()=>{E.click()});const ce=new ResizeObserver(()=>{R()});ce.observe(l);E.addEventListener("change",t=>{const e=t.target.files;!(e!=null&&e.length)||(X=e[0],document.getElementById("initial").style.display="none",document.getElementById("app").style.display="flex",R())});z.addEventListener("change",t=>{u=+t.target.value,R()});F.addEventListener("change",t=>{w=+t.target.value,g()});U.addEventListener("change",t=>{D=+t.target.value,g()});W.addEventListener("change",t=>{k=t.target.checked,g()});P.addEventListener("change",t=>{C=t.target.checked,g()});N.addEventListener("change",t=>{L=t.target.checked,g()});H.addEventListener("change",t=>{B=t.target.checked,g()});j.addEventListener("change",t=>{x=t.target.checked,g()});q.addEventListener("input",t=>{v=t.target.value.trim()[0]||v,Q()});G.addEventListener("input",t=>{M=+t.target.value,g()});const J=()=>{let t,e;return[new Promise((o,n)=>{t=o,e=n}),t,e]},se=t=>{const[e,r,o]=J(),n=new FileReader;return n.addEventListener("loadend",a=>{var c;(c=a.target)!=null&&c.result?r(a.target.result):o(new Error("Read file fail"))}),n.addEventListener("error",a=>{o(a)}),n.readAsDataURL(t),e},de=(t,e)=>{const[r,o,n]=J(),a=e!=null?e:new Image;return a.src=t,a.onload=()=>{o(a)},a.onerror=c=>{n(c)},r},Q=()=>{re.innerText=`
.text-shadow::before {
    content: '${v}';
}
`};Q();const R=async()=>{const t=await se(X);await de(t,l);const e=l.naturalHeight/l.naturalWidth;p.width=u,p.height=Math.round(u*e),S.width=h=Math.min(640,l.naturalWidth,l.clientWidth),S.height=h*e,K.drawImage(l,0,0,p.width,p.height),document.querySelectorAll(".size-wrap").forEach(r=>{const o=r.style;o.width=h+"px",o.height=h*e+"px"}),y.imageSmoothingEnabled=y.mozImageSmoothingEnabled=y.webkitImageSmoothingEnabled=y.msImageSmoothingEnabled=!1,y.drawImage(p,0,0,h,h*e),g()},g=()=>{var s;const t=l.naturalHeight/l.naturalWidth,e=h/u|0,r=Math.max(e-w,1)+"px",o=(s=ie(e))!=null?s:"none",n=e*u*t+"px",a=e*u+"px",c=D+"%";d.parentElement.style.height=n,d.parentElement.style.width=a,d.style.width=d.style.height=r,d.style.fontSize=Math.max(e-w,1)*(1+(M-1)/5)+"px",x?(d.style.textShadow=o,d.style.boxShadow="none",d.classList.add("text-shadow")):(d.style.textShadow="none",d.style.boxShadow=o,d.classList.remove("text-shadow")),d.style.borderRadius=c,m={blockSize:r,borderRadius:c,shadow:o,width:a,height:n}};function le(t,e,r){if(t>255||e>255||r>255)throw"Invalid color component";return(t<<16|e<<8|r).toString(16)}const ie=t=>{const e=[],r=l.naturalHeight/l.naturalWidth;for(let o=0;o<u*r;o++)for(let n=0;n<u;n++){const a=K.getImageData(n,o,1,1).data;if(k&&a[3]===0||C&&a[3]!==0&&a[0]===255&&a[1]===255&&a[2]===255)continue;const c=[...a];c.length=4;const s=L?"#"+("000000"+le(a[0],a[1],a[2])).slice(-6):`rgba(${c.map((f,b)=>b===3?+(f/255).toFixed(3):f).join(",")})`;e.push(`${s} ${n*t}px ${o*t}px`+(o===0&&n===0?` 0 ${t}px`+x?"":" inset":""))}return B?ae(e).join(","):e.join(",")};oe.addEventListener("click",()=>{te(`
.wrap {
    width: ${m.width};
    height: ${m.height};
}
.pixel {
    width: ${m.blockSize};
    height: ${m.blockSize};
    border-radius: ${m.borderRadius};
    box-shadow: ${m.shadow};
}
`),alert("\u5DF2\u590D\u5236\u5230\u526A\u5207\u677F")});
