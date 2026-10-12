import Script from 'next/script';

/**
 * GA4 и Яндекс.Метрика подключаются ТОЛЬКО при наличии ID в env.
 * Скрипты грузятся стратегией afterInteractive и не блокируют первый экран.
 */
export function Analytics() {
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID;
  const ym = process.env.NEXT_PUBLIC_YM_ID;

  return (
    <>
      {ga4 ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {ym ? (
        <Script id="ym-init" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${Number(ym)}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:false });`}
        </Script>
      ) : null}
    </>
  );
}
