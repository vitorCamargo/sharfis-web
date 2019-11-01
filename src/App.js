import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';

import ptBR from 'antd/lib/locale-provider/pt_BR';
import moment from 'moment';

import Home from './pages/home';

import 'moment/locale/pt-br';
import './App.css';

moment.locale('pt-BR');

const App = () => {
  return (
    <ConfigProvider locale = {ptBR}>
      <BrowserRouter>
        <Switch>
          <Route path = "/home" exact component = { Home } />
          
          <Route path = "/*" component = { Home } />
        </Switch>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;