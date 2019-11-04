import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';

import './style.css';

const { Footer } = Layout;
const { Text } = Typography;

const FooterContent = props => {
  return (
    <Footer style = {{ background: '#FAFCFE', padding: 30, textAlign: 'center' }}>
      <Row className = "footer-redes-sociais">
        <Col span = {12} style = {{ textAlign: 'left', marginTop: 20 }}>
          <Text strong style = {{ color: '#2D2E2E', fontSize: 11 }}> © 2019. </Text>
          <Text style = {{ color: '#2D2E2E', fontSize: 11 }}> Sharfis, Files Sharing System </Text>
        </Col>
      </Row>
    </Footer>
  );
}

export default FooterContent;