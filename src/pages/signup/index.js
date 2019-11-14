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

const SignUp = props => {
  const { getFieldDecorator, getFieldValue, validateFields } = props.form;

  const [loading, setLoading] = useState(false);
  const [nav, setNav] = useState('');

  useEffect(() => {
    if(getToken()) setNav('/myFolder');
  }, []);

  const validateToNextPassword = (rule, value, callback) => {
    if(value && getFieldValue('confirmPassword')) {
      validateFields(['confirmPassword'], { force: true });
    }
    callback();
  }

  const compareToFirstPassword = (rule, value, callback) => {
    if(value && value !== getFieldValue('password')) {
      callback('Senhas Incompatíveis!');
    } else {
      callback();
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);

    validateFields((err, values) => {
      if (!err) {
        const { email, name, password } = values;

        axios.post('/api/users', { email, name, password }).then(res => {
          login(res.data._id, res.data.name, res.data._id, res.data.folder);

          const hide = message.loading(`Bem-vindo ${name}!! 🤗`, 0);
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
              <Title level = {4} style = {{ fontWeight: 500 }}> Cadastro </Title>
              <Text type = "secondary"> Preencha as informações para se cadastrar no sistema. </Text>
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

            <Form.Item label = "Nome">
              { getFieldDecorator('name', {
                rules: [
                  { required: true, message: 'Por favor, digite um nome!' }
                ]
              })(
                <Input
                  prefix = {<Icon type = "smile" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                  placeholder = "nome" size = "large" style = {{ fontSize: 13 }}
                />
              )}
            </Form.Item>

            <Form.Item label = "Senha">
              { getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Por favor, insira uma senha!' },
                  { min: 8, message: 'Por favor, insira uma senha maior que 7!' },
                  { validator: validateToNextPassword }
                ]
              })(
                <Input.Password
                  prefix = {<Icon type = "lock" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                  placeholder = "senha" size = "large" style = {{ fontSize: 13 }}
                />
              )}
            </Form.Item>

            <Form.Item label = "Confirmar Senha">
              { getFieldDecorator('confirmPassword', {
                initialValue: '',
                rules: [
                  { required: true, message: 'Por favor, confirme sua senha!' },
                  { min: 8, message: 'Por favor, insira uma senha maior que 7!' },
                  { validator: compareToFirstPassword }
                ]
              })(
                <Input.Password
                  prefix = {<Icon type = "lock" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                  placeholder = "repita senha" size = "large" style = {{ fontSize: 13 }}
                />
              )}
            </Form.Item>

            <Row style = {{ textAlign: 'right' }}>
              <Button type = "link" onClick = { () => setNav('/login') }> Faça o Login </Button>

              <Button shape = "round" loading = {loading} type = "primary" htmlType = "submit" style = {{ fontSize: 12, minWidth: 100, padding: '0 10px' }}>
                <Text style = {{ color: '#FFF', fontWeight: 500 }}> Cadastrar </Text>
              </Button>
            </Row>
          </Form>
        </Card>
      </Row>
    );
  }
};

const WrappedNormalSignUpForm = Form.create({ name: 'signup' })(SignUp);
export default WrappedNormalSignUpForm;