import { prisma } from "@/lib/prisma";
import Script from "next/script";

export default async function TrackingScripts() {
  const settings = await prisma.trackingSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) return null;

  const isValidId = (id?: string | null) =>
    Boolean(
      id &&
      id.trim().length > 8 &&
      !id.toLowerCase().includes("your_") &&
      !id.toLowerCase().includes("dummy") &&
      !id.toLowerCase().includes("invalid") &&
      !id.toLowerCase().includes("pixel") &&
      !id.toLowerCase().includes("tiktok") &&
      !id.toLowerCase().includes("meta") &&
      !id.toLowerCase().includes("snap")
    );

  return (
    <>
      {/* 1. Google Tag Manager */}
      {settings.isGtmEnabled && isValidId(settings.gtmId) && (


        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.gtmId}');
            `,
          }}
        />
      )}

      {/* 2. Google Analytics 4 */}
      {settings.isGa4Enabled && isValidId(settings.ga4MeasurementId) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4MeasurementId}`} strategy="afterInteractive" />
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.ga4MeasurementId}');
              `,
            }}
          />
        </>
      )}

      {/* 3. Google Ads */}
      {settings.isGoogleAdsEnabled && isValidId(settings.googleAdsId) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsId}`} strategy="afterInteractive" />
          <Script
            id="gads-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAdsId}');
              `,
            }}
          />
        </>
      )}

      {/* 4. Meta Pixel */}
      {settings.isMetaPixelEnabled && isValidId(settings.metaPixelId) && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* 5. TikTok Pixel */}
      {settings.isTiktokPixelEnabled && isValidId(settings.tiktokPixelId) && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${settings.tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {/* 6. Snapchat Pixel */}
      {settings.isSnapchatPixelEnabled && isValidId(settings.snapchatPixelId) && (

        <Script
          id="snap-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
              a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
              r.src=n;var u=t.getElementsByTagName(s)[0];
              u.parentNode.insertBefore(r,u);})(window,document,
              'https://sc-static.net/scevent.min.js');
              snaptr('init', '${settings.snapchatPixelId}');
              snaptr('track', 'PAGE_VIEW');
            `,
          }}
        />
      )}

      {/* 7. LinkedIn Insight */}
      {settings.isLinkedinEnabled && settings.linkedinPartnerId && (
        <Script
          id="linkedin-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              _linkedin_partner_id = "${settings.linkedinPartnerId}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);})(window.lintrk);
            `,
          }}
        />
      )}

      {/* 8. X / Twitter Pixel */}
      {settings.isXPixelEnabled && settings.xPixelId && (
        <Script
          id="x-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
              },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
              a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
              twq('config','${settings.xPixelId}');
            `,
          }}
        />
      )}

      {/* 9. Custom Head Script */}
      {settings.isCustomScriptsEnabled && settings.customHeadScript && (
        <Script
          id="custom-head-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: settings.customHeadScript.replace(/<\/?script>/g, '') }}
        />
      )}
    </>
  );
}
