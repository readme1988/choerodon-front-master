import React, { lazy, Suspense, useContext, useState } from 'react';
import { Steps } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import axios from '../../../../tools/axios';
import { prompt } from '../../../../../../common';

const { Step } = Steps;

const tabs = {
  0: lazy(() => import('./steps/createType')),
  1: lazy(() => import('./steps/ProjectInfo')),
  2: lazy(() => import('./steps/ConfirmInfo')),
};

export default function CreateProjectWrap(props) {
  const [index, setIndex] = useState(0);
  const TabBlock = tabs[index];

  async function handleCreate() {
    const { context: { dataSet: { current }, AppState: { currentMenuType: { orgId } } }, modal } = props;
    if (await current.validate() === true) {
      const { applicationCode, applicationName, category, code, name } = current.toData();
      const data = {
        name,
        code,
        category,
        applicationVO: {
          name: applicationName,
          code: applicationCode,
          organizationId: orgId,
          type: 'custom',
        },
      };
      const res = await axios.post(`/base/v1/organizations/${orgId}/projects`, data);
      if (res.failed) {
        prompt(res.message);
      } else {
        prompt('创建成功');
        modal.close();
        props.context.dataSet.query();
      }
    }
  }

  async function handleCancel() {
    const { handleCancelCreateProject, modal } = props;
    await modal.close();
    handleCancelCreateProject();
  }

  async function handleGo(next) {
    if (next && index === 1) {
      const { context: { dataSet: { current } } } = props;
      if (await current.validate() === true) {
        setIndex(prev => prev + (next ? 1 : -1));
      }
    } else {
      setIndex(prev => prev + (next ? 1 : -1));
    }
  }

  function renderFooter() {
    return (
      <div style={{ height: '.72rem', borderTop: '1px solid rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', marginLeft: '-.24rem', marginRight: '-.24rem', paddingLeft: '.24rem', paddingRight: '.24rem' }}>
        {index !== 0 && <Button color="blue" funcType="raised" onClick={handleCreate}>创建</Button>}
        {index !== 2 && <Button color="blue" funcType="raised" onClick={() => handleGo(true)}>下一步</Button>}
        {index !== 0 && <Button className="active" funcType="raised" onClick={() => handleGo(false)}>上一步</Button>}
        <Button onClick={handleCancel} funcType="raised" className="active">取消</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Steps size="small" current={index}>
        <Step title="创建方式" />
        <Step title="项目信息" />
        <Step title="确认信息" />
      </Steps>
      <div style={{ flex: 1, marginTop: '.24rem' }}>
        <Suspense fallback={<span />}>
          <TabBlock {...props} />
        </Suspense>
      </div>
      {renderFooter()}
    </div>
  );
}