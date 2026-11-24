# Builds a single self-contained HTML preview of the web export (dist/) for sharing.
import base64,glob,os,re,sys
dist,out=sys.argv[1],sys.argv[2]
html=open(f'{dist}/index.html').read()
js=open(glob.glob(f'{dist}/_expo/static/js/web/entry-*.js')[0]).read()
USED=['Mali_400Regular.','Mali_500Medium.','Mali_600SemiBold.','Mali_700Bold.','Caveat_700Bold.']
def sub(m):
    p=m.group(1)
    if not any(u in p for u in USED): return m.group(0)
    b=base64.b64encode(open(dist+p,'rb').read()).decode()
    return f'"data:font/ttf;base64,{b}"'
js=re.sub(r'"(/assets/[^"]+\.ttf)"',sub,js)
js=js.replace('</script','<\\/script')
boot="<script>try{if(location.pathname!=='/')history.replaceState(null,'','/')}catch(e){}</script>"
html=re.sub(r'<script src="/_expo[^"]+"[^>]*></script>','',html)
html=html.replace('</head>',boot+'</head>').replace('</body>',f'<script>{js}</script></body>')
html=re.sub(r'<link rel="icon"[^>]*>','',html)
html=html.replace('<title>','<title>ọjịugo app').replace('ọjịugo app</title>','</title>',1) if False else html
open(out,'w').write(html)
print(len(html))
