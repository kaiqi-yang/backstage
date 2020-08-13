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

import React, { FC } from 'react';
import { Table, TableColumn, Progress } from '@backstage/core';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';

type User = {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  //   "id": "6d09fc45-722d-47bc-9ed9-a51bbd27ff82",
  //   "name": "Nicholas Krul",
  //   "email": "nicholas.krul@afterpaytouch.com",
  //   "avatar_url": "https://www.gravatar.com/avatar/270fbaff97e310c971878c23acb01741",
  //   "created_at": "2019-01-24T04:53:17.736Z"
};

type Build = {
  id: string;
  url: string;
  web_url: string;
  number: number;
  state: string;
  blocked: string;
  message: string;
  commit: string;
  branch: string;
  tag: string;
  env: object;
  source: string;
  creator: User;
  created_at: string;
  scheduled_at: string;
  started_at: string;
  finished_at: string;
  meta_data: object;
  pull_request: string;
  rebuilt_from: string;
  pipeline: object;
  jobs: object[];
};

type DenseTableProps = {
  builds: Build[];
};

const DenseTable: FC<DenseTableProps> = ({ builds }) => {
  const columns: TableColumn[] = [
    { title: '#', field: 'number' },
    { title: 'Message', field: 'message' },
    { title: 'Status', field: 'state' },
    { title: 'Creator', field: 'creator' },
    { title: 'Created At(UTC)', field: 'created_at' },
  ];

  const data = builds.map(build => {
    return {
      number: <a href={build.web_url}>{build.number}</a>,
      message: build.message,
      state: build.state,
      creator: build?.creator?.name,
      created_at: build?.created_at,
    };
  });

  return (
    <Table
      title="Recent builds from deploy-omega-paylater-core-containers pipeline"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

const ExampleFetchComponent: FC<{}> = () => {
  const { value, loading, error } = useAsync(async (): Promise<Build[]> => {
    const response = await fetch(
      'https://api.buildkite.com/v2/organizations/afterpay-paylater/pipelines/deploy-beta-paylater-core-containers/builds?branch=master&page=1&per_page=10',
      {
        headers: {
          Authorization: 'Bearer <>',
        },
      },
    );
    const data = await response.json();
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable builds={value || []} />;
};

export default ExampleFetchComponent;
