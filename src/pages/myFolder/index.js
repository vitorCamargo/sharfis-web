import React, { useEffect, useState } from 'react';
import { Breadcrumb, Tree, Typography, Spin, Modal, Menu, Dropdown, Upload, Row, Col, Table, Input, Button, Divider, Icon, Form, Popover, message, Select } from 'antd';
import { Redirect, Link, withRouter } from 'react-router-dom';

import axios from 'axios';
import moment from 'moment';

import { getFolder, getID } from '../../services/auth';
import { error, success } from '../../services/messages';

import MainLayout from '../../components/layout';

import './style.css';

const { Column } = Table;
const { DirectoryTree, TreeNode } = Tree;
const { Paragraph } = Typography;

const MyFolder = props => {
  const { getFieldDecorator, validateFields, setFieldsValue } = props.form;

  const [loadingPage, setLoadingPage] = useState(true);
  const [nav, setNav] = useState('');
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentFile, setCurrentFile] = useState([]);
  const [children, setChildren] = useState([]);
  const [path, setPath] = useState([]);

  const [filesToUpload, setFilesToUpload] = useState('');
  const [filesUploaded, setFilesUploaded] = useState([]);

  const [editNameText, setEditNameText] = useState('');
  const [enableEditRow, setEnableEditRow] = useState('');

  const [enableMovePopover, setEnableMovePopover] = useState('');
  const [fileMovePopover, setFileMovePopover] = useState('');

  const [fileShare, setFileShare] = useState('');

  const [buttonEditNameLoading, setButtonEditNameLoading] = useState(false);
  const [buttonMoveFileLoading, setButtonMoveFileLoading] = useState(false);
  const [buttonCreateDirectoryLoading, setButtonCreateDirectoryLoading] = useState(false);
  const [buttonShareDirectoryLoading, setButtonShareDirectoryLoading] = useState(false);
  const [visibleModalCreateDirectory, setVisibleModalCreateDirectory] = useState(false);
  const [visibleModalShareDirectory, setVisibleModalShareDirectory] = useState(false);

  const resetState = () => {
    setLoadingPage(true);
    setNav('');
    setFiles([]);
    setCurrentFile([]);
    setChildren([]);
    setPath([]);

    setFilesToUpload('');
    setFilesUploaded([]);

    setEditNameText('');
    setEnableEditRow('');

    setEnableMovePopover('');
    setFileMovePopover('');

    setFileShare('');

    setButtonEditNameLoading(false);
    setButtonMoveFileLoading(false);
    setButtonCreateDirectoryLoading(false);
    setButtonShareDirectoryLoading(false);
    setVisibleModalCreateDirectory(false);
    setVisibleModalShareDirectory(false);
  };

  useEffect(() => {
    resetState();
    const fileID = props.match.params.id || getFolder();

    axios.get('/api/files').then(res => {
      const files = res.data;
      const filesID = files.map(e => e._id);
      const path = [];

      const currentFile = files[filesID.indexOf(fileID)];

      let childrenDirectory = [];
      let childrenFile = [];
      let id = fileID;

      while(files[filesID.indexOf(id)].father) {
        path.unshift(files[filesID.indexOf(id)]);

        const fatherID = files[filesID.indexOf(id)].father;
        id = fatherID;
      }

      currentFile.children.forEach(child => {
        const childFile = files[filesID.indexOf(child)];

        if(childFile) {
          if(childFile.type === 1) {
            childrenDirectory.push({
              _id: childFile._id,
              name: childFile.name,
              father: childFile.father,
              file: childFile.file,
              type: childFile.type,
              updatedAt: childFile.updatedAt
            });
          } else {
            childrenFile.push({
              _id: childFile._id,
              name: childFile.name,
              father: childFile.father,
              file: childFile.file,
              type: childFile.type,
              updatedAt: childFile.updatedAt
            });
          }
        }
      });

      childrenDirectory = childrenDirectory.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));
      childrenFile = childrenFile.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));

      setFiles(files);
      setCurrentFile(currentFile);
      setChildren(childrenDirectory.concat(childrenFile));
      setPath(path);

      setLoadingPage(false);
    }).catch((err) => {
      error(err);
      setLoadingPage(false);
    });

    axios.get('/api/users').then(res => {
      setUsers(res.data);
    }).catch(err => {
      error(err);
    });
  }, [props.match.params.id]);

  const tableChange = (pagination, filters, sorter) => {
    let childrenDirectory = [];
    let childrenFile = [];

    children.forEach(item => {
      if(item.type === 1) {
        childrenDirectory.push(item);
      } else {
        childrenFile.push(item);
      }
    });

    childrenDirectory = childrenDirectory.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));
    childrenFile = childrenFile.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));

    if(sorter && sorter.order === 'descend') {
      childrenDirectory = childrenDirectory.reverse();
      childrenFile = childrenFile.reverse();
    }

    setChildren(childrenDirectory.concat(childrenFile));
  };

  const directoryNameValidation = (rule, value, callback) => {
    if(children[children.map((e) => e.name).indexOf(value)]) {
      callback('Nome já Cadastrado nessa Pasta!');
    } else {
      callback();
    }
  };

  const handleFilterSearch = (selectedKeys, confirm) => confirm();

  const handleResetFilters = (clearFilters) => clearFilters();

  const showModalCreateDirectory = () => setVisibleModalCreateDirectory(true);

  const hideModalCreateDirectory = () => setVisibleModalCreateDirectory(false);

  const showModalShareDirectory = (id) => {
    const file = files[files.map(e => e._id).indexOf(id)];

    setFileShare(file);
    setFieldsValue({
      'shared_with': file.shared_with.filter(r => users.map(e => e._id).includes(r))
    });

    setVisibleModalShareDirectory(true);
  };

  const hideModalShareDirectory = () => setVisibleModalShareDirectory(false);

  const renameDirectory = (id) => {
    setButtonEditNameLoading(true);

    const value = editNameText;
    const file = children[children.map((e) => e.name).indexOf(value)];

    if(!value || (file && file._id !== id)) {
      if(!value) {
        message.error('Tem problema aqui, ó: Digite um nome válido.');
      } else {
        message.error('Tem problema aqui, ó: Já tem pasta/arquivo com esse nome.');
      }
      setButtonEditNameLoading(false);
    } else {
      axios.put('/api/files', { name: value, id }).then(() => {
        window.location.reload()
      }).catch((err) => {
        error(err);
        setButtonEditNameLoading(false);
      });
    }
  };

  const moveDirectory = (record) => {
    setButtonMoveFileLoading(true);

    axios.put('/api/files/move', { idChild: record._id, idFather: fileMovePopover || getFolder() }).then(() => {
      setNav(`/myFolder/${fileMovePopover}`);
    }).catch((err) => {
      error(err);
      setButtonMoveFileLoading(false);
    });
  };

  const deleteDirectory = (id) => {
    axios.delete(`/api/files/${id}`).then(() => {
      window.location.reload()
    }).catch((err) => {
      error(err);
    });
  };

  const createDirectory = (e) => {
    setButtonCreateDirectoryLoading(true);
    e.preventDefault();

    validateFields(['name'], (err, values) => {
      if(!err) {
        const { name } = values;

        axios.post('/api/files', { name, father: currentFile._id, type: 1, owner: getID() }).then(() => {
          window.location.reload();
        }).catch((err) => {
          error(err);
          setButtonCreateDirectoryLoading(false);
        });
      } else {
        setButtonCreateDirectoryLoading(false);
      }
    });
  };

  const shareFile = (e) => {
    setButtonShareDirectoryLoading(true);
    e.preventDefault();

    validateFields(['shared_with'], (err, values) => {
      if(!err) {
        const { shared_with } = values;

        axios.put('/api/files/sharing', { shared_with, id: fileShare._id }).then(() => {
          success();
          window.location.reload();
        }).catch((err) => {
          error(err);
          setButtonShareDirectoryLoading(false);
        });
      } else {
        setButtonShareDirectoryLoading(false);
      }
    });
  };

  const beforeUploadFiles = (file, fileList) => {
    setFilesToUpload(fileList);
    setFilesUploaded([]);

    return true;
  };

  useEffect(() => {
    setLoadingPage(true);

    if(filesToUpload && filesToUpload.length > 0) {
      for(let currentPhotoIndex = 0; currentPhotoIndex < filesToUpload.length; currentPhotoIndex++) {

        const filesTotalSize = filesToUpload.length;
        const fileCurrent = filesToUpload[currentPhotoIndex];

        const formData = new FormData();
        formData.append('api_key', '584136724691346');
        formData.append('timestamp', (Date.now() / 1000));
        formData.append('upload_preset', 'p9jvf6ai');
        formData.append('file', fileCurrent);

        axios.post('https://api.cloudinary.com/v1_1/dnnkqjrbi/raw/upload', formData, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }).then(res => {
          const file = res.data;
          const substringsFile = file.public_id.split('.');

          if(!file.format) file.format = substringsFile.length > 1 ? substringsFile[substringsFile.length - 1] : ' ';

          axios.post('/api/files', { name: res.data.original_filename, father: currentFile._id, type: 2, file, owner: getID() }).then(() => {
            const files = filesUploaded.concat(currentPhotoIndex);

            setFilesUploaded(files);
            if(filesTotalSize === files.length) {
              window.location.reload();
            }
          }).catch((err) => {
            error(err);
            setLoadingPage(false);
          });
        }).catch((err) => {
          error(err);
          setLoadingPage(false);
        });
      }
    }
  }, [filesToUpload]);

  if(nav) return (<Redirect to = { nav } />);
  else
    return (
      <MainLayout page = "myFolder" loading = {loadingPage}>
        <Row style = {{ marginBottom: 0, display: 'flex' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to = "/myFolder"><Icon type = "home" /></Link>
            </Breadcrumb.Item>
            { path.map((item, index) => (
              path.length === index + 1 ? (
                <Breadcrumb.Item style = {{ cursor: 'pointer' }} key = { item._id }>{item.name}</Breadcrumb.Item>
              ) : (
                <Breadcrumb.Item key = { item._id }>
                  <Link to = {`/myFolder/${item._id}`}>{item.name}</Link>
                </Breadcrumb.Item>
              )
            ))}
          </Breadcrumb>

          <Dropdown
            placement = "bottomRight"
            overlay = {(
              <Menu>
                <Menu.Item onClick = { showModalCreateDirectory }> <Icon type = "folder" /> &nbsp; Pasta </Menu.Item>
                <Menu.Item> <Upload showUploadList = {false} beforeUpload = { beforeUploadFiles } fileList = { filesToUpload } multiple> <Icon type = "file" /> &nbsp; Arquivos </Upload> </Menu.Item>
              </Menu>
            )}
          >
            <Button style = {{ marginLeft: 'auto', marginRight: 10 }} icon = "plus" type = "primary"> Novo </Button>
          </Dropdown>
        </Row>

        <Divider style = {{ marginTop: 5 }} />

        <Table
          onChange = { tableChange }
          locale = {{ emptyText: 'Não há nada nessa pasta... Adicione um arquivo.' }}
          dataSource = { children }
          pagination = {false}
          rowKey = { record => record._id }
          onRow = { record => ({
            onDoubleClick: () => (record.type === 1 ? setNav(`/myFolder/${record._id}`) : window.open(record.file.url, '_blank'))
          })}
        >
          <Column
            className = "columnType"
            width = {20}
            dataIndex = "type"
            render = { (name, record) => (record.type === 1 ? (
              <Icon theme = "twoTone" twoToneColor = "#4B6584" type = "folder" />
            ) : ['jpg', 'png', 'gif'].includes(record.file.format.toLowerCase()) ? (
              <Icon theme = "twoTone" twoToneColor = "#A55EEA" type = "file-image" />
            ) : record.file.format.toLowerCase() === 'pdf' ? (
              <Icon theme = "twoTone" twoToneColor = "#EB3B5A" type = "file-pdf" />
            ) : record.file.format.toLowerCase() === 'md' ? (
              <Icon theme = "twoTone" twoToneColor = "#FED330" type = "file-markdown" />
            ) : ['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm', 'rtf', 'odt'].includes(record.file.format.toLowerCase()) ? (
              <Icon theme = "twoTone" twoToneColor = "#3867D6" type = "file-word" />
            ) : ['html', 'txt'].includes(record.file.format.toLowerCase()) ? (
              <Icon theme = "twoTone" twoToneColor = "#4B7BEC" type = "file-text" />
            ) : ['ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'ppsm', 'pot', 'potx', 'potm'].includes(record.file.format.toLowerCase()) ? (
              <Icon theme = "twoTone" twoToneColor = "#FA8231" type = "file-ppt" />
            ) : ['xlsx', 'xlsm', 'xlt', 'xltx', 'xltm', 'ods', 'csv', 'tsv', 'tab'].includes(record.file.format.toLowerCase()) ? (
              <Icon theme = "twoTone" twoToneColor = "#20BF6B" type = "file-excel" />
            ) : ['zip', 'rar', '7z', 'tar'].includes(record.file.format.toLowerCase()) ? (
              <Icon theme = "twoTone" twoToneColor = "#778CA3" type = "file-zip" />
            ) : (
              <Icon theme = "twoTone" twoToneColor = "#4B6584" type = "file" />
            ))}
          />

          <Column
            title = "Nome"
            key = "name"
            dataIndex = "name"
            sorter
            defaultSortOrder = "ascend"
            filterDropdown = { ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
              <div style = {{ padding: 8 }}>
                <Input
                  placeholder = "Procurar por nome"
                  value = { selectedKeys[0] }
                  onChange = { e => setSelectedKeys(e.target.value ? [e.target.value] : []) }
                  onPressEnter = { () => handleFilterSearch(selectedKeys, confirm) }
                  style = {{ width: 188, marginBottom: 8, display: 'block' }}
                />

                <Button type = "primary" onClick = { () => handleFilterSearch(selectedKeys, confirm) } icon = "search" size = "small" style = {{ width: 90, marginRight: 8 }}> Procurar </Button>
                <Button onClick = { () => handleResetFilters(clearFilters) } size = "small" style = {{ width: 90 }}> Resetar </Button>
              </div>
            )}
            filterIcon = { filtered => (<Icon type = "search" style = {{ color: filtered ? '#1890ff' : undefined }} />) }
            onFilter = { (value, record) => (record.name ? record.name.toString().toLowerCase().includes(value.toLowerCase()) : null) }
            render = { (name, record) => (
              enableEditRow === record._id ? (
                <Row style = {{ display: 'flex' }}>
                  <Input disabled = { buttonEditNameLoading } onPressEnter = { () => renameDirectory(record._id) } value = { editNameText } onChange = { value => setEditNameText(value.target.value) } />
                  <Button loading = { buttonEditNameLoading } icon = "check" type = "primary" onClick = { () => renameDirectory(record._id) } style = {{ marginLeft: 5, marginRight: 5 }} />
                  <Button disabled = { buttonEditNameLoading } icon = "close" type = "danger" onClick = { () => { setEnableEditRow(''); setEditNameText(''); } } />
                </Row>
              ) : (
                <Popover
                  placement = "bottomLeft"
                  arrowPointAtCenter
                  trigger = "contextMenu"
                  onVisibleChange = { visible => (!visible ? setEnableMovePopover('') : null) }
                  visible = { enableMovePopover === record._id }
                  title = {(
                    <span>
                      Escolha uma pasta para mover... &nbsp;&nbsp;
                      <Icon className = "close-modal-move-directory" type = "close" onClick = { () => setEnableMovePopover('') } />
                    </span>
                  )}
                  content = {(
                    <div>
                      <Paragraph strong style = {{ marginBottom: 2 }}> { files[files.map(e => e._id).indexOf(fileMovePopover || getFolder())].name }: </Paragraph>

                      { files && files.length ? (
                        <DirectoryTree expandedKeys = {[fileMovePopover]} onExpand = { (expandedKeys) => setFileMovePopover(expandedKeys[expandedKeys.length - 1]) }>
                          { fileMovePopover && getFolder() !== fileMovePopover ? (<TreeNode title = "/.." key = { files[files.map(e => e._id).indexOf(fileMovePopover)].father } />) : '' }

                          { files[files.map(e => e._id).indexOf(fileMovePopover || getFolder())].children.map(child => {
                            const childFile = files[files.map(e => e._id).indexOf(child)];
                            if(childFile && childFile.type === 1) {
                              return (<TreeNode disabled = { record._id === childFile._id } title = { childFile.name } key = { childFile._id } />);
                            }
                            return '';
                          })}
                        </DirectoryTree>
                      ) : (<Spin />) }

                      <Button loading = { buttonMoveFileLoading } onClick = { () => moveDirectory(record) } style = {{ width: '100%', marginTop: 10 }} disabled = { files[files.map(e => e._id).indexOf(fileMovePopover || getFolder())]._id === record.father } type = "primary" size = "small"> Mover Aqui </Button>
                    </div>
                  )}
                >
                  { record.type === 1 ? name || '' : record.file.format !== ' ' ? `${name || ''}.${record.file.format}` : name || '' }
                </Popover>
              )
            )}
          />

          <Column align = "right" title = "Última Modificação" key = "updatedAt" dataIndex = "updatedAt" render = { date => (<span> {moment(date).format('DD [de] MMMM [de] YYYY')} </span>) } />

          <Column
            align = "right"
            key = "_id"
            dataIndex = "_id"
            width = {20}
            render = {(id, record) => (
              <Dropdown
                overlay = {(
                  <Menu>
                    <Menu.Item onClick = { () => { setEnableEditRow(id); setEditNameText(record.name); setEnableMovePopover(''); setFileMovePopover(''); } }> <Icon type = "edit" /> Renomear </Menu.Item>
                    <Menu.Item onClick = { () => { setEnableMovePopover(id); setFileMovePopover(''); setEnableEditRow(''); setEditNameText(''); } }> <Icon type = "snippets" /> Mover </Menu.Item>
                    <Menu.Item onClick = { () => { setEnableMovePopover(''); setFileMovePopover(''); setEnableEditRow(''); setEditNameText(''); showModalShareDirectory(id); } }> <Icon type = "global" /> Compartilhar </Menu.Item>

                    <Menu.Item
                      onClick = { () => {
                        Modal.confirm({
                          title: 'Deseja realmente apagar esta pasta?',
                          content: 'Esta ação é permanente, ainda não implmentamos lixeira (e nem vamos)',
                          okType: 'danger',
                          onOk() {
                            deleteDirectory(id);
                          },
                          onCancel() {}
                        });
                      }}
                    >
                      <Icon type = "delete" /> Excluir
                    </Menu.Item>
                  </Menu>
                )}
                placement = "bottomRight"
              >
                <Icon style = {{ cursor: 'pointer' }} type = "more" />
              </Dropdown>
            )}
          />
        </Table>

        <Modal visible = { visibleModalCreateDirectory } footer = { null } onCancel = { hideModalCreateDirectory } centered width = {391}>
          <Paragraph style = {{ fontSize: 30, textAlign: 'center', marginBottom: 5 }}> Nova Pasta </Paragraph>

          <Divider style = {{ fontSize: 20, minWidth: '60%', width: '60%', marginTop: 0, marginLeft: 'auto', marginRight: 'auto' }}>
            <Icon type = "folder-add" />
          </Divider>

          <Row gutter = {16}>
            <Form onSubmit = { createDirectory }>
              <Row gutter = {16}>
                <Col span = {24}>
                  <Form.Item>
                    { getFieldDecorator('name', {
                      rules: [
                        { required: true, whitespace: true, message: 'Por favor, insira um nome para a pasta!' },
                        { validator: directoryNameValidation }
                      ]
                    })(
                      <Input
                        prefix = { <Icon type = "folder" style = {{ color: 'rgba(0, 0, 0, 0.25)' }} /> }
                        placeholder = "Nova Pasta"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Row style = {{ textAlign: 'right' }}>
                <Button size = "default" onClick = { hideModalCreateDirectory } style = {{ marginRight: 8 }}> Cancelar </Button>
                <Button loading = { buttonCreateDirectoryLoading } type = "primary" htmlType = "submit" size = "default"> Criar </Button>
              </Row>
            </Form>
          </Row>
        </Modal>

        <Modal visible = { visibleModalShareDirectory } footer = { null } onCancel = { hideModalShareDirectory } centered width = {391}>
          <Paragraph style = {{ fontSize: 30, textAlign: 'center', marginBottom: 5 }}> Compartilhar </Paragraph>

          <Divider style = {{ fontSize: 20, minWidth: '60%', width: '60%', marginTop: 0, marginLeft: 'auto', marginRight: 'auto' }}>
            <Icon type = "global" />
          </Divider>

          <Row gutter = {16}>
            <Form onSubmit = { shareFile }>
              <Row gutter = {16}>
                <Col span = {24}>
                  <Form.Item>
                    { getFieldDecorator('shared_with', {
                      initialValue: []
                    })(
                      <Select
                        prefix = { <Icon type = "user" style = {{ color: 'rgba(0, 0, 0, 0.25)' }} /> }
                        placeholder = "Pesquise usuário por nome"
                        showSearch
                        optionFilterProp = "children"
                        mode = "multiple"
                      >
                        { users.filter(r => r._id !== getID()).map(item => (
                          <Select.Option key = {item._id} value = {item._id}> {item.name} [{item.email}] </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Row style = {{ textAlign: 'right' }}>
                <Button size = "default" onClick = { hideModalShareDirectory } style = {{ marginRight: 8 }}> Cancelar </Button>
                <Button loading = { buttonShareDirectoryLoading } type = "primary" htmlType = "submit" size = "default"> Compartilhar </Button>
              </Row>
            </Form>
          </Row>
        </Modal>
      </MainLayout>
    );
};

const WrappedMyFolder = Form.create({ name: 'myFolder' })(MyFolder);
export default withRouter(WrappedMyFolder);
