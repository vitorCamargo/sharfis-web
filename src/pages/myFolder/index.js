import React, { useEffect, useState } from 'react';
import { Row, Breadcrumb, Dropdown, Menu, Icon, Upload, Divider, Button } from 'antd';
import { Redirect, Link } from 'react-router-dom';

import axios from 'axios';

import { getFolder } from '../../services/auth';
import { error } from '../../services/messages';

import MainLayout from '../../components/layout';

import './style.css';

const MyFolder = props => {
  const [loadingPage, setLoadingPage] = useState(true);
  const [nav, setNav] = useState('');
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState([]);
  const [children, setChildren] = useState([]);
  const [path, setPath] = useState([]);

  const [filesToUpload, setFilesToUpload] = useState('');

  useEffect(() => {
    setLoadingPage(false);
    const fileID = props.match.params.id || getFolder();

    axios.get('/api/files').then(res => {
      const files = res.data;
      const filesID = files.map(e => e._id);
      const path = [];

      const currentFile = files[filesID.indexOf(fileID)];

      let childrenDirectory = [];
      let childrenFile = [];
      let id = fileID;

      while(files[filesID.indexOf(id)].father !== getFolder() && files[filesID.indexOf(id)].father) {
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
              father: childFile.father[0],
              file: childFile.file,
              type: childFile.type,
              updatedAt: childFile.updatedAt
            });
          } else {
            childrenFile.push({
              _id: childFile._id,
              name: childFile.name,
              father: childFile.father[0],
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
  }, [props.match.params.id]);

  const showModalCreateDirectory = () => {};

  const beforeUploadFiles = (file, fileList) => {};

  const uploadFiles = () => {};

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
                <Menu.Item> <Upload showUploadList = {false} beforeUpload = { beforeUploadFiles } customRequest = { uploadFiles } fileList = { filesToUpload } multiple> <Icon type = "file" /> &nbsp; Arquivos </Upload> </Menu.Item>
              </Menu>
            )}
          >
            <Button style = {{ marginLeft: 'auto', marginRight: 10 }} icon = "plus" type = "primary"> Novo </Button>
          </Dropdown>
        </Row>

        <Divider style = {{ marginTop: 5 }} />
      </MainLayout>
    );
};

export default MyFolder;