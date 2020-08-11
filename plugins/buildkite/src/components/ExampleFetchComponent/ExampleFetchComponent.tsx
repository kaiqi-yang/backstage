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
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableColumn, Progress } from '@backstage/core';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';

const useStyles = makeStyles({
  avatar: {
    height: 32,
    width: 32,
    borderRadius: '50%',
  },
});

type User = {

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
    creator: object;
    created_at: string;
    scheduled_at: string;
    started_at: string;
    finished_at: string;
    meta_data: object;
    pull_request: string;
    rebuilt_from: string;
    pipeline: object;
    jobs: object[]
};

type DenseTableProps = {
  users: User[];
};

export const DenseTable: FC<DenseTableProps> = ({ users }) => {
  const classes = useStyles();

  const columns: TableColumn[] = [
    { title: 'BuildNumber', field: 'number' },
    { title: 'Message', field: 'message' },
    { title: 'Status', field: 'state' },
    { title: 'Creator', field: 'creator' },
  ];

  const data = users.map(user => {
    return {
      number: (<a href={user.web_url}>{user.number}</a>),
      message: user.message,
      state: user.state,
      creator: user.branch
    };
  });

  return (
    <Table
      title="Example User List (fetching data from randomuser.me)"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

const ExampleFetchComponent: FC<{}> = () => {
  const { value, loading, error } = useAsync(async (): Promise<User[]> => {
    console.log("here")
    const response = await fetch('https://ypm9jrkyna.execute-api.ap-southeast-2.amazonaws.com/test');
    const data = await response.json();
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable users={value || []} />;
};

export default ExampleFetchComponent;
