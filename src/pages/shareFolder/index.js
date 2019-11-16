import React, { useEffect, useState } from 'react';
import { Table, Row, Breadcrumb, Input, Divider, Button, Icon, Form } from 'antd';
import { Redirect, Link } from 'react-router-dom';

import axios from 'axios';
import moment from 'moment';

import { getID } from '../../services/auth';
import { error } from '../../services/messages';

import MainLayout from '../../components/layout';

import './style.css';

const { Column } = Table;

const ShareFolder = props => {
  const [loadingPage, setLoadingPage] = useState(true);
  const [nav, setNav] = useState('');
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]);

  const resetState = () => {
    setLoadingPage(true);
    setNav('');
    setChildren([]);
  };

  useEffect(() => {
    resetState();

    axios.get('/api/users').then(res => {
      setUsers(res.data);
    }).catch(err => {
      error(err);
    });

    axios.get('/api/files').then(res => {
      let children = [];

      if(!props.match.params.id) {
        const files = res.data.filter(r => r.shared_with.includes(getID()));
  
        let childrenDirectory = [];
        let childrenFile = [];

        files.forEach(item => {
          if(!files[files.map(e => e._id).indexOf(item.father)]) {
            if(item.type === 1) {
              childrenDirectory.push({
                _id: item._id,
                name: item.name,
                father: item.father,
                file: item.file,
                type: item.type,
                updatedAt: item.updatedAt,
                owner: item.owner
              });
            } else {
              childrenFile.push({
                _id: item._id,
                name: item.name,
                father: item.father,
                file: item.file,
                type: item.type,
                updatedAt: item.updatedAt,
                owner: item.owner
              });
            }
          }
        });

        childrenDirectory = childrenDirectory.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));
        childrenFile = childrenFile.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));

        children = childrenDirectory.concat(childrenFile);
      } else {
        const files = res.data.filter(r => r.shared_with.includes(getID()));
        const currentFile = files[files.map(e => e._id).indexOf(props.match.params.id)];

        let filePermission = files[files.map(e => e._id).indexOf(currentFile._id)];
        let hasPermission = false;

        while((filePermission && filePermission.father) || !hasPermission) {
          if(filePermission.shared_with.includes(getID())) hasPermission = true;

          filePermission = files[files.map(e => e._id).indexOf(filePermission.father)];
        }

        let childrenDirectory = [];
        let childrenFile = [];

        if(hasPermission) {
          currentFile.children.forEach(item => {
            const file = files[files.map(e => e._id).indexOf(item)];

            if(file)
              if(file.type === 1) {
                childrenDirectory.push({
                  _id: file._id,
                  name: file.name,
                  father: file.father,
                  file: file.file,
                  type: file.type,
                  updatedAt: file.updatedAt,
                  owner: file.owner
                });
              } else {
                childrenFile.push({
                  _id: file._id,
                  name: file.name,
                  father: file.father,
                  file: file.file,
                  type: file.type,
                  updatedAt: file.updatedAt,
                  owner: file.owner
                });
              }
          });
        }

        childrenDirectory = childrenDirectory.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));
        childrenFile = childrenFile.sort((a, b) => (a.name && b.name ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : 1));

        children = childrenDirectory.concat(childrenFile);
      }

      setChildren(children);

      setLoadingPage(false);
    }).catch((err) => {
      error(err);
      setLoadingPage(false);
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

  const handleFilterSearch = (selectedKeys, confirm) => confirm();

  const handleResetFilters = (clearFilters) => clearFilters();

  if(nav) return (<Redirect to = { nav } />);
  else
    return (
      <MainLayout page = "shareWithMe" loading = {loadingPage}>
        <Row style = {{ marginBottom: 0, display: 'flex' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to = "/shareWithMe"><Icon type = "deployment-unit" /></Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Row>

        <Divider style = {{ marginTop: 5 }} />

        <Table
          onChange = { tableChange }
          locale = {{ emptyText: 'Não há nada nessa pasta...' }}
          dataSource = { children }
          pagination = {false}
          rowKey = { record => record._id }
          onRow = { record => ({
            onDoubleClick: () => (record.type === 1 ? setNav(`/shareWithMe/${record._id}`) : window.open(record.file.url, '_blank'))
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
              <span> { record.type === 1 ? name || '' : record.file.format !== ' ' ? `${name || ''}.${record.file.format}` : name || '' } </span>
            )}
          />

          <Column
            align = "right"
            title = "Compartilhado por"
            key = "owner"
            dataIndex = "owner"
            render = { user => (
              <span>
                { users[users.map(e => e._id).indexOf(user)] ? 
                  `${users[users.map(e => e._id).indexOf(user)].email}`
                :
                  '---'
                } </span>) } />

          <Column align = "right" title = "Última Modificação" key = "updatedAt" dataIndex = "updatedAt" render = { date => (<span> {moment(date).format('DD [de] MMMM [de] YYYY')} </span>) } />
        </Table>
      </MainLayout>
    );
};

const WrappedShareFolder = Form.create({ name: 'shareFolder' })(ShareFolder);
export default WrappedShareFolder;