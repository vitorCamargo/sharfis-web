import React, { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Icon, Menu, Avatar, Badge, Popover, Card, Upload, message, Form, Input } from 'antd';
import { error, success } from '../../services/messages';

import MainLayout from '../../components/layout';

import './style.css';

import axios from 'axios';

import { getID } from '../../services/auth' ;

const { Paragraph } = Typography;

const Profile = props => {
  const { getFieldDecorator, setFieldsValue, getFieldValue, validateFields } = props.form;

  const [loadingPage, setLoadingPage] = useState(true);
  const [tab, setTab] = useState('info');
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [photo, setPhoto] = useState({
    profilePhoto: [],
    newProfilePhoto: [],
    loading: false
  });
  const [buttonLoading, setButtonLoading] = useState(false);
  const [pageUpdate, setPageUpdate] = useState(false);

  useEffect(() => {
    setLoadingPage(true);
    axios.get('/api/users/').then(res => {
      const user = res.data[res.data.map(e => e._id).indexOf(getID())];
      setUser(user);
      setUsers(res.data);
      setPhoto({ loading: false, profilePhoto: user.image, newProfilePhoto: [] });
      setLoadingPage(false);
    }).catch((err) => {
      setLoadingPage(false);
      error(err);
    });
  }, [pageUpdate]);

  const beforeUploadPhoto = (file) => {
    if(file.type === 'image/jpeg' || file.type === 'image/png') {
      const arquivos = [file];
      setPhoto({ ...photo, newProfilePhoto: arquivos });
      return true;
    }
    message.error('Extensão Inválida! Permitido apenas imagens');
    setPhoto({ ...photo, newProfilePhoto: [] });
    return false;
  }

  const changeProfilePhoto = () => {
    setPhoto({ ...photo, loading: true });
    
    const formData = new FormData();
    formData.append('api_key', '584136724691346');
    formData.append('timestamp', (Date.now() / 1000));
    formData.append('upload_preset', 'p9jvf6ai');
    formData.append('file', photo.newProfilePhoto[0]);

    axios.post('https://api.cloudinary.com/v1_1/dnnkqjrbi/image/upload', formData, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }).then(res => {
      const image = res.data.secure_url;

      axios.put('/api/users', { id: user._id, superuser: '', image }).then(res => {
        setPhoto({ ...photo, loading: false });
        setPageUpdate(!pageUpdate);
        success();
      }).catch(err => {
        setPhoto({ ...photo, loading: false });
        error(err);
      });
    }).catch(err => {
      setPhoto({ ...photo, loading: false });
      error(err);
    });
  }

  const resetFields = () => {
    setFieldsValue({
      'name': user.name,
      'email': user.email,
      'password': '',
      'confirmPassword': ''
    });
  }

  const emailValidation = (rule, value, callback) => {
    if((value && users[users.map((e) => e.email).indexOf(value)]) && value !== user.email) {
      callback('Email já Cadastrado!');
    } else {
      callback();
    }
  }

  const validateToNextPassword = (rule, value, callback) => {
    if (value && getFieldValue('confirmPassword')) {
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

  const handleEditInfo = e => {
    setButtonLoading(true);
    e.preventDefault();

    validateFields(['name', 'email'], (err, values) => {
      if(!err) {
        const { name, email } = values;
        axios.put('/api/users', { id: user._id, name, email, superuser: '' }).then(res => {
          setPageUpdate(!pageUpdate);
          setButtonLoading(false);
          success();
        }).catch(err => {
          setButtonLoading(false);
          error(err);
        });
      } else {
        setButtonLoading(false);
      }
    });
  }

  const handleEditPassword = e => {
    setButtonLoading(true);
    e.preventDefault();

    validateFields(['password', 'confirmPassword'], (err, values) => {
      if(!err) {
        const { password } = values;
        axios.put('/api/users', { id: user._id, password }).then(res => {
          setPageUpdate(!pageUpdate);
          setButtonLoading(false);
          success();
        }).catch(err => {
          setButtonLoading(false);
          error(err);
        });
      } else {
        setButtonLoading(false);
      }
    });
  }
  
  return (
    <MainLayout page = "Perfil" loading = {loadingPage} title = "Pefil do Usuário" breadcrumb = {['Meu Perfil']}>
      <Row gutter = {16}>
        <Col span = {7}>
          <Card bordered = {false} className = "alert-card" style = {{ borderRadius: 5 }}>
              <Badge count = {<Popover placement = "right" content = "Administrador"> <Icon type = "star" theme = "filled" style = {{ color: '#FFFFFF', background: '#5ECC62', borderRadius: '50%', padding: 8, marginTop: 10, marginRight: 10 }}/> </Popover>}>
                <Avatar shape = "square" style = {{ width: '100%', height: 'auto' }} src = { photo.newProfilePhoto.length === 0 ? photo.profilePhoto : photo.newProfilePhoto } />
              </Badge>
            {/* ) : (
              <Avatar shape = "square" style = {{ width: '100%', height: 'auto' }} src = { photo.newProfilePhoto.length === 0 ? photo.profilePhoto : photo.newProfilePhoto } />
            )} */}
            <Paragraph style = {{ fontSize: 21, marginTop: 10, marginBottom: 0 }} ellipsis strong> { user.name } </Paragraph>
            <Paragraph style = {{ fontSize: 14, marginBottom: 0 }} ellipsis type = "secondary"> { user.email } </Paragraph>

            <Menu style = {{ width: '100%', marginTop: 20 }} defaultSelectedKeys = {[tab]} onClick = { (e) => setTab(e.key) }>
              <Menu.Item key = "info">
                <Icon type = "idcard" /> Informações Básicas
              </Menu.Item>

              <Menu.Item key = "password">
                <Icon type = "lock" /> Mudar Senha
              </Menu.Item>
            </Menu>
          </Card>
        </Col>

        <Col span = {17}>
          <Card bordered = {false} className = "alert-card" style = {{ borderRadius: 5 }}
            title = {
              <>
                <Icon type = "smile" style = {{ marginRight: 6, color: '#00AD45' }} /> { tab === 'info' ? 'Minhas Informações' : 'Minha Senha' }
              </>
            }
          >
            { tab === 'info' ? (
              <Form onSubmit = { handleEditInfo } className = "profile-form" layout = "inline" style = {{ width: '100%', display: 'inline-grid'}} wrapperCol = {{ xs: { span: 24, offset: 0, }, sm: { span: 16, offset: 8 } }}>
                <Form.Item label = "Foto de Perfil">
                  { getFieldDecorator('profilePhoto')(
                    <Row>
                      <Avatar shape = "square" size = {200} src = { photo.newProfilePhoto.length === 0 ? photo.profilePhoto : photo.newProfilePhoto } />

                      <Upload beforeUpload = { beforeUploadPhoto } customRequest = { changeProfilePhoto } fileList = { photo.newProfilePhoto } showUploadList = {false} accept = "image/*">
                        <Button loading = { photo.loading } icon = "plus" type = "primary" style = {{ backgroundColor: '#2D2E2E', borderColor: '#2D2E2E', position: 'absolute', bottom: 2, left: 2 }}> Adicionar Imagem </Button>
                      </Upload>
                    </Row>
                  )}
                </Form.Item>

                <Form.Item label = "Nome">
                  { getFieldDecorator('name', {
                    initialValue: user.name,
                    rules: [{ required: true, message: 'Por favor, insira um nome!' }]
                  })(
                    <Input
                      prefix = {<Icon type = "user" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                      placeholder = "Seu Nome"
                    />
                  )}
                </Form.Item>

                <Form.Item label = "Email">
                  { getFieldDecorator('email', {
                    initialValue: user.email,
                    rules: [
                      { required: true, message: 'Por favor, digite um email!' },
                      { type: 'email', message: 'Por favor, digite um email válido!' },
                      { validator: emailValidation }
                    ]
                  })(
                    <Input
                      prefix = {<Icon type = "mail" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                      placeholder = "nome@exemplo.com" style = {{ fontSize: 13 }}
                    />
                  )}
                </Form.Item>

                <Row style = {{ textAlign: 'right' }}>
                  <Button size = "default" onClick = { resetFields } style = {{ marginRight: 8 }}> Limpar </Button>
                  <Button loading = { buttonLoading } type = "primary" htmlType = "submit" size = "default"> Salvar </Button>
                </Row>
              </Form>
            ) : (
              <Form onSubmit = { handleEditPassword }>
                <Row gutter = {16}>
                  <Col span = {12}>
                    <Form.Item label = "Senha">
                      { getFieldDecorator('password', {
                        initialValue: '',
                        rules: [
                          { required: true, message: 'Por favor, insira uma senha!' },
                          { min: 8, message: 'Por favor, insira uma senha maior que 7!' },
                          { validator: validateToNextPassword }
                        ]
                      })(
                        <Input.Password
                          prefix = {<Icon type = "lock" style = {{ color: 'rgba(0, 0, 0, .25)' }} />}
                          placeholder = "senha" style = {{ fontSize: 13 }}
                        />
                      )}
                    </Form.Item>
                  </Col>

                  <Col span = {12}>
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
                          placeholder = "senha" style = {{ fontSize: 13 }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>

                <Row style = {{ textAlign: 'right' }}>
                  <Button size = "default" onClick = { resetFields } style = {{ marginRight: 8 }}> Limpar </Button>
                  <Button loading = { buttonLoading } type = "primary" htmlType = "submit" size = "default"> Salvar </Button>
                </Row>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
      {/* <Card
        bordered = {false} className = "alert-card" style = {{ borderRadius: 5 }}
        title = {
          <>
            <Icon type = "user" style = {{ marginRight: 6, color: '#00AD45' }} />Meu Perfil
          </>
        }
        extra = {
          <Button type = "primary" onClick = {() => handleUpdate()} style = {{ color: "white"}} > Salvar Mudanças </Button>
        }
      >
        <Row type = "flex" jutify = "center">
          <Col span = {4} offset = {2}>
            <Avatar shape = "square" size = {200} src = { newProfilePhoto.length === 0 ? profilePhoto : newProfilePhoto } />
            <Upload beforeUpload = { beforeUploadPhoto } customRequest = { changeProfilePhoto } fileList = { newProfilePhoto } showUploadList = {false} accept = "image/*">
              <Button icon = "plus" type = "primary" style = {{ backgroundColor: '#383A3F', borderColor: '#383A3F', position: 'absolute', bottom: 5, left: 12 }}> Adicionar Imagem </Button>
            </Upload>
          </Col>
          <Col span = {10} offset = {1}>
            <Form layout = "vertical">
              <Form.Item>
                {getFieldDecorator('userNameUpdate', {
                  rules: [{ required: true, message: 'Please input your username!' }],
                })(
                  <Input
                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Nome do Usuário"
                  />,
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('emailUpdate', {
                  rules: [{type: 'email', message: 'Email Inválido'},
                    { required: true, message: 'Please input your email!' },
                  ],
                })(
                  <Input
                    prefix={<Icon type="google" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="E-mail"
                  />,
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('passwordUpdate', {
                  initialValue : '',
                  rules: [{validator: passwordValidatorUpdate }],
                })(
                  <Input.Password
                    prefix={<Icon type="unlock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Senha"
                  />,
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('confirmPasswordUpdate', {
                  initialValue : '',
                  rules: [{validator: compareToFirstPasswordUpdate }],
                })(
                  <Input.Password
                    prefix={<Icon type="unlock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="Confirmação de senha"
                  />,
                )}
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card> */}
    </MainLayout>
  );
};

const WrappedProfileForm = Form.create({ name: 'Profile' })(Profile);
export default WrappedProfileForm;