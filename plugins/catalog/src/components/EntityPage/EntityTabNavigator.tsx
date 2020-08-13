/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HeaderTabs } from '@backstage/core';
import React from 'react';

import { useNavigate, useParams } from 'react-router-dom';

export type NavigationTab = {
  id: string;
  label: string;
  content?: (props: any) => React.ReactNode;
  show?: (props: any) => boolean;
};

export type OnChangeCallback = (tab: NavigationTab) => void;

type Props<T> = {
  tabs: NavigationTab[];
  onChange?: OnChangeCallback;
  tabData: T;
};

/**
 * The tabs at the top of the catalog list page, for component type filtering.
 */
export const EntityTabNavigator = <T extends {}>({
  tabs,
  tabData,
}: Props<T>) => {
  const navigate = useNavigate();
  const {
    kind,
    optionalNamespaceAndName,
    selectedTabId = 'overview',
  } = useParams();

  const selectedTab = tabs.find(tab => tab.id === selectedTabId);

  const filteredTabs = tabs.filter(tab =>
    tab.show ? tab.show(tabData) : true,
  );

  return (
    <>
      <HeaderTabs
        tabs={filteredTabs}
        onChange={idx => {
          navigate(
            `/catalog/${kind}/${optionalNamespaceAndName}/${tabs[idx].id}`,
          );
        }}
        selectedIndex={tabs.findIndex(tab => tab.id === selectedTabId)}
      />
      {selectedTab && selectedTab.content ? selectedTab.content(tabData) : null}
    </>
  );
};
