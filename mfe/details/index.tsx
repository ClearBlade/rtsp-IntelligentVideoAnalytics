import { getBasePath } from "@clearblade/ia-mfe-core";
import { AppProviders, useAuth } from "@clearblade/ia-mfe-react";
import { Subscribe } from "@react-rxjs/core";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import singleSpaReact from "single-spa-react";
import IVADetails from "./IVADetails";

function IntelligentVideoAnalyticsRoot(props) {
  return (
    <AppProviders>
      <BrowserRouter basename={getBasePath()}>
        <Subscribe>
          <IVADetails {...props} />
        </Subscribe>
      </BrowserRouter>
    </AppProviders>
  );
}

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: IntelligentVideoAnalyticsRoot,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
