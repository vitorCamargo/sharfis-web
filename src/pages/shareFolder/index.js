import React from 'react';
import { Typography } from 'antd';

import MainLayout from '../../components/layout';

import './style.css';

const { Text } = Typography;

const shareFolder = props => {
  return (
    <MainLayout page = "shareWithMe" loading = {false}>
      <Text>oioio</Text>
    </MainLayout>
  );
};

export default shareFolder;