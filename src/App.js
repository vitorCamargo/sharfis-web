import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import ptBR from 'antd/lib/locale-provider/pt_BR';
import moment from 'moment';

import MyFolder from './pages/myFolder';
import GlobalFolder from './pages/globalFolder';
import ShareFolder from './pages/shareFolder';

import Login from './pages/login';

import 'moment/locale/pt-br';
import './App.css';

moment.locale('pt-BR');

const App = () => {
  return (
    <ConfigProvider locale = {ptBR}>
      <BrowserRouter>
        <Switch>
          <Route path = "/myFolder" exact component = { MyFolder } />
          <Route path = "/globalFolder" exact component = { GlobalFolder } />
          <Route path = "/shareWithMe" exact component = { ShareFolder } />
          <Route path = "/" exact component = { Login } />

          <Route path = "/*" component = { GlobalFolder } />
        </Switch>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;