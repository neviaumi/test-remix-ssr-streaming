import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import { cacheExchange, Client, fetchExchange, Provider } from 'urql';

export const links: LinksFunction = () => [
];

export function Layout({ children }: { children: React.ReactNode }) {
  const client = new Client({
    exchanges: [cacheExchange, fetchExchange],
    url: 'http://localhost:8080/graphql',
  });
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider value={client}>
          {children}
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
