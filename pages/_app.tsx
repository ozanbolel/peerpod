import * as React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { FusionContainer } from "react-fusionui";
import ContextProvider from "store";
import "styles/app.scss";
import fusionCSS from "styles/fusion.module.scss";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <FusionContainer
      modalClassNames={{
        container: fusionCSS.container,
        modal: fusionCSS.modal
      }}
      dialogClassNames={{
        container: fusionCSS.container,
        dialog: fusionCSS.dialog,
        content: fusionCSS.content,
        actionContainer: fusionCSS.actionContainer,
        action: fusionCSS.action,
        actionLabel: fusionCSS.actionLabel,
        highlight: fusionCSS.highlight
      }}
    >
      <ContextProvider>
        <Head>
          <meta charSet="utf-8" />
          <title>PeerPod</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="" />
          <link rel="apple-touch-icon" href="" />
          <meta name="description" content="" />
          <meta property="og:title" content="PeerPod" />
          <meta property="og:description" content="" />
          <meta property="og:image" content="" />
          <meta property="twitter:title" content="PeerPod" />
          <meta property="twitter:description" content="" />
          <meta property="twitter:image" content="" />
        </Head>

        <Component {...pageProps} />
      </ContextProvider>
    </FusionContainer>
  );
};

export default App;
