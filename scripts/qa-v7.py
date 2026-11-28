"""Render and interact with V7 via intercepted local resources, without external network."""
import asyncio,mimetypes,pathlib,json
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
ROUTES=['home','learn','practice','cards','dictionary','results','progress','achievements','leaderboard','profile','lesson/de-01','grammar','listening','plan','games','auth','support']
async def main():
    (ROOT/'screens-v7').mkdir(exist_ok=True)
    async with async_playwright() as pw:
        b=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
        c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1)
        page=await c.new_page()
        errors=[];bad=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('response',lambda r:bad.append((r.status,r.url)) if r.status>=400 else None)
        async def serve(route):
            url=route.request.url
            if 'jsdelivr.net' in url:
                stub="window.supabase={createClient(){return {auth:{getSession:async()=>({data:{session:null},error:null}),onAuthStateChange(){}},from(){return {select(){return {order(){return this},range:async()=>({data:null,error:{message:'Offline smoke test'}})}}}}}}};"
                return await route.fulfill(status=200,body=stub,content_type='text/javascript',headers={'access-control-allow-origin':'*'})
            path=url.split('peera.test',1)[-1].split('?',1)[0].split('#',1)[0].lstrip('/')
            target=(ROOT/path).resolve()
            if not target.is_relative_to(ROOT) or not target.is_file():
                return await route.fulfill(status=404,body='not found '+path,headers={'access-control-allow-origin':'*'})
            return await route.fulfill(status=200,body=target.read_bytes(),content_type=mimetypes.guess_type(str(target))[0] or 'application/octet-stream',headers={'access-control-allow-origin':'*'})
        await page.route('https://peera.test/**',serve)
        await page.route('https://cdn.jsdelivr.net/**',serve)
        html=(ROOT/'index.html').read_text(encoding='utf8').replace('<head>','<head><base href="https://peera.test/">')
        await page.set_content(html,wait_until='load',timeout=30000)
        await page.wait_for_function('document.querySelector("main")!==null',timeout=25000)
        print('INIT', (await page.locator('h1').all_inner_texts())[:2])
        for route in ROUTES:
            await page.evaluate('(r)=>location.hash="#/"+r',route)
            await page.wait_for_timeout(200)
            info=await page.evaluate('''() => ({w:document.documentElement.scrollWidth,sw:innerWidth,txt:document.querySelector('main')?.innerText.length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),active:document.querySelector('.bottom-nav .nav-item.active')?.textContent.trim()})''')
            if info['w']>info['sw']+1 or info['txt']<30 or info['broken']:
                protruding=await page.evaluate('''() => [...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+3&&r.width>0}).slice(-12).map(e=>[e.tagName,e.className?.toString().slice(0,70),Math.round(e.getBoundingClientRect().right),Math.round(e.getBoundingClientRect().width)])''')
                raise RuntimeError(f'FAIL {route}: {info}, overflow={protruding}')
            if route in ['home','learn','practice','dictionary','results','cards','lesson/de-01','profile']:
                await page.screenshot(path=str(ROOT/'screens-v7'/(route.replace('/','-')+'.png')),full_page=True)
            print('PASS',route,info['txt'],'chars, active nav=',info['active'])
        await page.evaluate('location.hash="#/dictionary"');await page.wait_for_timeout(150)
        await page.locator('[data-input=search]').fill('Hallo')
        if await page.locator('.dict-item').count()<1:raise RuntimeError('Dictionary search failed')
        await page.locator('.dict-item [data-action=word-detail]').first.click()
        if not await page.locator('.word-detail-card').is_visible():raise RuntimeError('Word detail failed')
        await page.locator('[data-action=close-word]').first.click()
        await page.evaluate('location.hash="#/cards"');await page.wait_for_timeout(180)
        if not await page.locator('.grade-btn').first.is_disabled():raise RuntimeError('Grade active before flipping')
        await page.locator('[data-action=flip-card]').last.click();await page.wait_for_timeout(70)
        if await page.locator('.grade-btn').first.is_disabled():raise RuntimeError('Grade remained disabled')
        await page.locator('[data-grade="2"]').click()
        await page.evaluate('location.hash="#/lesson/de-01"');await page.wait_for_timeout(200)
        for i in range(12):
            btn=page.locator('[data-action=next-word]')
            if not await btn.count() or await btn.is_disabled():break
            await btn.click()
        await page.locator('[data-action=next-stage]').click();await page.locator('[data-action=next-stage]').click()
        for i in range(4):
            options=page.locator(f'[data-action=answer][data-index="{i}"]')
            if await options.count():await options.first.click()
        await page.locator('[data-action=next-stage]').click()
        if not await page.locator('.done-banner').count():raise RuntimeError('Lesson quiz result missing')
        print('PASS interactive dictionary, flashcards, lesson flow')
        if errors:raise RuntimeError('JS errors: '+str(errors))
        if bad:print('HTTP warnings',bad[:8])
        await b.close()
asyncio.run(main())
