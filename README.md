# Chat Applications with Firebase Cloud Messaging

We can successfully build a real-time chat application with [Next.js](https://nextjs.org/) using [Socket.IO](https://socket.io/). The real-time communication however was found not to function well once the package is deployed to Vercel, which is a serverless platform. It is suggested by Vercel two main approaches to applying a real-time model to stateless serverless functions.

1. Serverless Functions have maximum execution limits and should respond as quickly as possible. They should not subscribe to data events. Instead, we need a client that subscribes to data events (such as [Alby](https://ably.com/), [Pusher](https://pusher.com/), etc.) and a serverless function that publishes new data.
2. Rather than pushing data, we can fetch real-time data on-demand. For example, the Vercel dashboard delivers realtime updates using [SWR](https://swr.vercel.app/).

In this demonstration, we build a real-time chat application with [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging). The Firebase Cloud Messaging(FCM) JavaScript API lets you receive notification messages in web apps running in browsers that support the [Push API](https://www.w3.org/TR/push-api/). This includes the browser versions listed in this [support matrix](https://caniuse.com/push-api) and Chrome extensions via the Push API.


### [View the App](https://firebase-realtime-chat.vercel.app)
### [App GitHub](https://github.com/jglchen/firebase-realtime-chat)
### Docker: docker run -p 3000:3000 jglchen/firebase-realtime-chat
