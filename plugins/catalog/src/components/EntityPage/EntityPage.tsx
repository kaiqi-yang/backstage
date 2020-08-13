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

import { Entity } from '@backstage/catalog-model';
import {
  Content,
  errorApiRef,
  Header,
  HeaderLabel,
  Page,
  pageTheme,
  PageTheme,
  Progress,
  useApi,
} from '@backstage/core';
import { SentryIssuesWidget } from '@backstage/plugin-sentry';
import { ExampleFetchComponent } from '@backstage/plugin-buildkite';
import { Widget as GithubActionsWidget } from '@backstage/plugin-github-actions';
import { Grid, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { catalogApiRef } from '../..';
import { EntityContextMenu } from '../EntityContextMenu/EntityContextMenu';
import { EntityMetadataCard } from '../EntityMetadataCard/EntityMetadataCard';
import { UnregisterEntityDialog } from '../UnregisterEntityDialog/UnregisterEntityDialog';
import { FavouriteEntity } from '../FavouriteEntity/FavouriteEntity';
import { EntityTabNavigator } from './EntityTabNavigator';

const REDIRECT_DELAY = 1000;
function headerProps(
  kind: string,
  namespace: string | undefined,
  name: string,
  entity: Entity | undefined,
): { headerTitle: string; headerType: string } {
  return {
    headerTitle: `${name}${namespace ? ` in ${namespace}` : ''}`,
    headerType: (() => {
      let t = kind.toLowerCase();
      if (entity && entity.spec && 'type' in entity.spec) {
        t += ' — ';
        t += (entity.spec as { type: string }).type.toLowerCase();
      }
      return t;
    })(),
  };
}

export const getPageTheme = (entity?: Entity): PageTheme => {
  const themeKey = entity?.spec?.type?.toString() ?? 'home';
  return pageTheme[themeKey] ?? pageTheme.home;
};

const EntityPageTitle: FC<{ title: string; entity: Entity | undefined }> = ({
  entity,
  title,
}) => (
  <Box display="inline-flex" alignItems="center" height="1em">
    {title}
    {entity && <FavouriteEntity entity={entity} />}
  </Box>
);

export const EntityPage: FC<{}> = () => {
  const { optionalNamespaceAndName, kind } = useParams() as {
    optionalNamespaceAndName: string;
    kind: string;
  };
  const navigate = useNavigate();
  const [name, namespace] = optionalNamespaceAndName.split(':').reverse();

  const errorApi = useApi(errorApiRef);
  const catalogApi = useApi(catalogApiRef);

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const { value: entity, error, loading } = useAsync(
    () => catalogApi.getEntityByName({ kind, namespace, name }),
    [catalogApi, kind, namespace, name],
  );

  useEffect(() => {
    if (!error && !loading && !entity) {
      errorApi.post(new Error('Entity not found!'));
      setTimeout(() => {
        navigate('/');
      }, REDIRECT_DELAY);
    }
  }, [errorApi, navigate, error, loading, entity]);

  if (!name) {
    navigate('/catalog');
    return null;
  }

  const cleanUpAfterRemoval = async () => {
    setConfirmationDialogOpen(false);
    navigate('/');
  };

  const showRemovalDialog = () => setConfirmationDialogOpen(true);

  // TODO - Replace with proper tabs implementation
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: ({ entity: e }: { entity: Entity }) => {
        return (
          <Content>
            <Grid container spacing={3}>
              <Grid item sm={4}>
                <EntityMetadataCard entity={e} />
              </Grid>
              <Grid item sm={8}>
                <SentryIssuesWidget
                  sentryProjectId="afterpay-core"
                  statsFor="24h"
                />
              </Grid>
              {e.metadata?.annotations?.['backstage.io/github-actions-id'] && (
                <Grid item sm={3}>
                  <GithubActionsWidget entity={e} branch="master" />
                </Grid>
              )}
            </Grid>
          </Content>
        );
      },
    },
    {
      id: 'ci',
      label: 'CI/CD',
      content: ({ entity: e }: { entity: Entity }) => {
        return (
          <Content>
            <Grid container spacing={3}>
              <Grid item sm={4}>
                <EntityMetadataCard entity={e} />
              </Grid>
              <Grid item sm={12}>
                <ExampleFetchComponent />
              </Grid>
            </Grid>
          </Content>
        );
      },
    },
    {
      id: 'tests',
      label: 'Tests',
    },
    {
      id: 'api',
      label: 'API',
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
    },
    {
      id: 'quality',
      label: 'Quality',
    },
  ];

  const { headerTitle, headerType } = headerProps(
    kind,
    namespace,
    name,
    entity,
  );

  return (
    <Page theme={getPageTheme(entity)}>
      <Header
        title={<EntityPageTitle title={headerTitle} entity={entity} />}
        pageTitleOverride={headerTitle}
        type={headerType}
      >
        {entity && (
          <>
            <HeaderLabel
              label="Owner"
              value={entity.spec?.owner || 'unknown'}
            />
            <HeaderLabel
              label="Lifecycle"
              value={entity.spec?.lifecycle || 'unknown'}
            />
            <EntityContextMenu onUnregisterEntity={showRemovalDialog} />
          </>
        )}
      </Header>

      {loading && <Progress />}

      {error && (
        <Content>
          <Alert severity="error">{error.toString()}</Alert>
        </Content>
      )}

      {entity && (
        <>
          <EntityTabNavigator<{ entity: Entity }>
            tabs={tabs}
            tabData={{ entity }}
          />

          <UnregisterEntityDialog
            open={confirmationDialogOpen}
            entity={entity}
            onConfirm={cleanUpAfterRemoval}
            onClose={() => setConfirmationDialogOpen(false)}
          />
        </>
      )}
    </Page>
  );
};
