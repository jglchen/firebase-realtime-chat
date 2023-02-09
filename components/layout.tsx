import Head from 'next/head';

export default function Layout({ children}: {children: JSX.Element}) {
    return (
        <>
           <Head>
             <title>Chat Applications with Firebase Cloud Messaging</title>
             <link rel="icon" href="/favicon.ico" />
           </Head>
           <main>
              {children}
           </main>   
        </>
    );
}


