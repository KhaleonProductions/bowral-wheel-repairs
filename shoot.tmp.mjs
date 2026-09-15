import { chromium } from 'playwright';
const [port, theme, out] = process.argv.slice(2);
const routes = [['home','/'],['about','/about'],['services','/services'],['process','/process'],['gallery','/gallery'],['contact','/contact']];
const b = await chromium.launch();
for (const [w,h,tag] of [[1440,900,'desktop'],[390,844,'mobile']]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  for (const [name, route] of routes) {
    await p.goto(`http://localhost:${port}${route}`, { waitUntil:'networkidle' });
    await p.waitForTimeout(700);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (ov) errs.push(`H-OVERFLOW ${route}`);
    await p.screenshot({ path:`${out}/${theme}-${tag}-${name}.png`, fullPage: tag==='desktop' });
  }
  await ctx.close();
  console.log(`${theme} ${tag}: ${errs.length ? 'ISSUES '+JSON.stringify(errs.slice(0,6)) : 'clean'}`);
}
await b.close();
