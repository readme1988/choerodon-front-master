import React from 'react';
import { withRouter, HashRouter as Router, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import { inject, observer, Provider } from 'mobx-react';
import { Spin } from 'choerodon-ui';
import Outward from './containers/components/c7n/routes/outward';
import asyncRouter from './containers/components/util/asyncRouter';
import asyncLocaleProvider from './containers/components/util/asyncLocaleProvider';
import { authorizeC7n, getAccessToken, setAccessToken, dashboard, WEBSOCKET_SERVER } from './containers/common';
import AppState from './containers/stores/c7n/AppState';
import noaccess from './containers/components/c7n/tools/error-pages/403';
import stores from './containers/stores';
import Master from './containers/components/c7n/master';
import './containers/components/style';

const spinStyle = {
  textAlign: 'center',
  paddingTop: 300,
};

const UILocaleProviderAsync = asyncRouter(
  () => import('choerodon-ui/lib/locale-provider'),
  { locale: () => import(`choerodon-ui/lib/locale-provider/${AppState.currentLanguage}.js`) },
);

const language = AppState.currentLanguage;
const IntlProviderAsync = asyncLocaleProvider(language, 
  () => import(`./containers/locale/${language}`),
  () => import(`react-intl/locale-data/${language.split('_')[0]}`));

@withRouter
@observer
export default class Index extends React.Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    if (!this.isInOutward(this.props.location.pathname)) {
      this.auth();
    }
  }

  auth = async () => {
    this.setState({ loading: true });
    const { access_token: accessToken, token_type: tokenType, expires_in: expiresIn } = queryString.parse(window.location.hash);
    if (accessToken) {
      setAccessToken(accessToken, tokenType, expiresIn);
      window.location.href = window.location.href.replace(/[&?]redirectFlag.*/g, '');
    } else if (!getAccessToken()) {
      authorizeC7n();
      return false;
    }
    AppState.setUserInfo(await AppState.loadUserInfo());
    this.setState({ loading: false });
  }

  isInOutward = (pathname) => {
    // eslint-disable-next-line no-underscore-dangle
    const injectOutward = window._env_.outward;
    if (injectOutward) {
      const arr = injectOutward.split(',').map(r => r.replace(/['"']/g, ''));
      return arr.some(v => pathname.startsWith(v));
    }
    return false;
  }

  render() {
    const { loading } = this.state;
    if (this.isInOutward(this.props.location.pathname)) {
      return (
        <UILocaleProviderAsync>
          <IntlProviderAsync>
            <Provider {...stores}>
              <Switch>
                <Route path="/">
                  <Outward AutoRouter={this.props.AutoRouter} />
                </Route>
              </Switch>
            </Provider>
          </IntlProviderAsync>
        </UILocaleProviderAsync>
      );
    } else {
      if (loading) {
        return (
          <div style={spinStyle}>
            <Spin />
          </div>
        );
      }
      return (
        <UILocaleProviderAsync>
          <IntlProviderAsync>
            <Provider {...stores}>
              <Switch>
                <Route
                  path="/"
                  // component={this.auth() ? Master : noaccess}
                >
                  <Master AutoRouter={this.props.AutoRouter} />
                </Route>
              </Switch>
            </Provider>
          </IntlProviderAsync>
        </UILocaleProviderAsync>
      );
    }
  }
}
