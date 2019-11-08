import React, { useState, useEffect } from 'react';
import { Form, Row, Button, Card, Input, Icon, Typography, message } from 'antd';
import { Redirect } from 'react-router-dom';

import axios from 'axios';

import { login, getToken } from '../../services/auth';
import { error } from '../../services/messages';

import './style.css';

const { Title, Text } = Typography;

const logo = require('../../images/logo.png');
const back = require('../../images/back.jpg');

const Login = props => {
  const { getFieldDecorator } = props.form;

  const [loading, setLoading] = useState(false);
  const [nav, setNav] = useState('');

  useEffect(() => {
    if(getToken()) setNav('/myFolder');
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);

    props.form.validateFields((err, values) => {
      if (!err) {
        const { email, password } = values;

        axios.post('/api/users/login', { email, password }).then(res => {
          login(res.data.token, res.data.user.name, res.data.user._id);

          const hide = message.loading(`Bem-vindo ${res.data.user.name}!! 🤗`, 0);
          setTimeout(hide, 1500);

          setNav('/myFolder');
        }).catch(err => {
          setLoading(false);

          error(err);
        });
      } else setLoading(false);
    });
  }

  if(nav) return (<Redirect to = {nav} />);
  else {
    return (
      <Row className = "login-content" style = {{ backgroundImage: `url(${back})` }}>
        <Card className = "login-box" bodyStyle = {{ padding: 40 }} bordered = {false}>
          <Row style = {{ display: 'flex' }}>
            <img style = {{ height: 70, cursor: 'auto', paddingRight: 10, borderRight: '1px solid #E0E0DF' }} src = {logo} alt = "Logo Sharfis" />

            <Row style = {{ marginLeft: 10 }}>
              <Title level = {4} style = {{ fontWeight: 500 }}> Login </Title>
              <Text type = "secondary"> Preencha as informações para se logar. </Text>
            </Row>
          </Row>

          <Form onSubmit = {handleSubmit} className = "login-form" style = {{ marginTop: 30 }}>
            <Form.Item label = "Email">
              { getFieldDecorator('email', {
                rules: [
                  { required: true, message: 'Por favor, digite um email!' },
                  { type: 'email', message: 'Por favor, digite um email válido!' }
                ]
              })(
                <Input
                  prefix = {<Icon type = "user" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                  placeholder = "nome@exemplo.com" size = "large" style = {{ fontSize: 13 }}
                />
              )}
            </Form.Item>

            <Form.Item label = "Senha">
              { getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Por favor, insira uma senha!' },
                  { min: 8, message: 'Por favor, insira uma senha maior que 7!' }
                ]
              })(
                <Input.Password
                  prefix = {<Icon type = "lock" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                  placeholder = "senha" size = "large" style = {{ fontSize: 13 }}
                />
              )}
            </Form.Item>

            <Row style = {{ textAlign: 'right' }}>
              <Button type = "link" onClick = { () => setNav('/signup') }> Cadastre-se </Button>

              <Button shape = "round" loading = {loading} type = "primary" htmlType = "submit" style = {{ fontSize: 12, minWidth: 100, padding: '0 10px' }}>
                <Text style = {{ color: '#FFF', fontWeight: 500 }}> Entrar </Text>
              </Button>
            </Row>
          </Form>
        </Card>
      </Row>
    );
  }
};

const WrappedNormalLoginForm = Form.create({ name: 'login' })(Login);
export default WrappedNormalLoginForm;