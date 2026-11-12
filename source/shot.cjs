const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [name,w,h] of [['d',1440,900],['m',390,844]]){
 const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('http://localhost:4173/');
 await p.waitForTimeout(900);await p.screenshot({path:`s-${name}-boot.png`});
 await p.waitForTimeout(3800);await p.screenshot({path:`s-${name}-home.png`,fullPage:name==='m'});
 for(const id of ['talks','desk','problems','records','whatsapp','mail','booking','reports','settings']){
  await p.evaluate((id)=>{location.hash='#/'+id;window.dispatchEvent(new PopStateEvent('popstate'))},id);
  await p.waitForTimeout(2300);await p.screenshot({path:`s-${name}-${id}.png`,fullPage:name==='m'});
 }
 await p.evaluate(()=>{location.hash='#/problems';window.dispatchEvent(new PopStateEvent('popstate'))});await p.waitForTimeout(1500);
 await p.click('button[aria-label="Слушать запись"] >> nth=0');await p.waitForTimeout(1200);
 await p.click('text=Разбор ИИ >> nth=0');await p.waitForTimeout(1500);await p.screenshot({path:`s-${name}-talk.png`});
 console.log(name,errs.slice(0,5),await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth));
}
await b.close()})();
