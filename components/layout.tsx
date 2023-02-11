import Head from 'next/head';

export default function Layout({ children}: {children: JSX.Element}) {
    return (
        <>
           <Head>
             <title>Chat Applications with Firebase Cloud Messaging</title>
             <link rel="icon" href="/favicon.ico" />
             <meta
              name="description"
              content="A real-time chat application with Firebase Cloud Messaging"
              />
             <meta name="og:title" content="Chat Applications with Firebase Cloud Messaging" />
             <meta
              property="og:description"
              content="A real-time chat application with Firebase Cloud Messaging"
              />
           </Head>
           <main>
              {children}
           </main>   
        </>
    );
}


