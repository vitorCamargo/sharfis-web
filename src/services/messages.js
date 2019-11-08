import { notification } from 'antd';

export const success = (title, message) => {
  notification.success({
    message: title || 'DEU CERTO',
    description: message || 'Ação realizada com sucesso.'
  });
}

export const error = (err) => {
  if(err.response && err.response.status === 503) err503();
  else if(err.response && err.response.status === 401) err401();
  else errGeneral();
}

export const warning = (id) => {
  if(id === 1) {
    notification.warning({
      message: 'AVISO',
      description: 'Parece que você não está logado, para utilizar todos os nossos serviços, loga ae 👻.'
    });
  }
}

const err503 = () => {
  notification.error({
    message: 'ERRO 503',
    description: 'Servidor está inacessível no momento, tente carregar a página novamente, se o erro persistir, entre em contato com o técnico.'
  });
}

const err401 = () => {
  notification.error({
    message: 'ERRO 401',
    description: 'Erro ao realizar a ação. Você não tem permissão para isto.'
  });
}

const errGeneral = () => {
  notification.error({
    message: 'ERRO',
    description: 'Erro ao realizar esta ação. Mas não entendemos direito o que houve, tente carregar a página novamente, se o erro persistir, entre em contato com o técnico.'
  });
}