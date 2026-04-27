import appConfig from "@/lib/core/config";

export default function Head() {
  return (
    <>
      <link
        rel="preconnect"
        href={appConfig.R2_PUBLIC_URL}
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href={appConfig.R2_PUBLIC_URL} />

      <link
        rel="preconnect"
        href={appConfig.SERVER_URL}
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href={appConfig.SERVER_URL} />

      <script
        id="theme-script"
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var k='payload-theme';var t=localStorage.getItem(k);var next=(t==='dark'||t==='light')?t:'light';document.documentElement.setAttribute('data-theme',next);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();",
        }}
      />
    </>
  );
}
