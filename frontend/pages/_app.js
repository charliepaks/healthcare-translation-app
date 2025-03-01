import '../styles/globals.css'

"export default function MyApp({ Component, pageProps }) {"
"  return <Component {...pageProps} />"
"}"

import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;