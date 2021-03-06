import React, { Component } from 'react';
import queryString from 'query-string';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { Button, Icon } from 'choerodon-ui';
import findFirstLeafMenu from '../../util/findFirstLeafMenu';

@withRouter
@inject('AppState', 'MenuStore')
@observer
export default class Setting extends Component {
  gotoOrganizationManager = () => {
    const { org: { id, name, type, category, organizationId }, history, MenuStore } = this.props;
    MenuStore.loadMenuData({ type: 'organization', id }, false).then((menus) => {
      if (menus.length) {
        const { route, domain } = findFirstLeafMenu(menus[0]);
        let path = route || '';
        path += `?type=${type}&id=${id}&name=${encodeURIComponent(name)}${category ? `&category=${category}` : ''}`;
        path += `&organizationId=${id}`;
        history.push(path);
      }
    });
  }

  render() {
    const classString = classNames({ block: true });
    return (
      <Button className={classString} onClick={this.gotoOrganizationManager}>
        <Icon type="settings " style={{ marginLeft: '5px' }} />
        管理中心
      </Button>
    );
  }
}
