import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { PropertyProvider } from './contexts/PropertyContext';

function App() {
  return (
    <Provider store={store}>
      <PropertyProvider>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#28b463',
              colorInfo: '#123a70',
              borderRadius: 16,
              fontFamily: 'Inter, Segoe UI, sans-serif',
            },
          }}
        >
          <AntApp>
            <AppRoutes />
            <ToastContainer position="top-right" />
          </AntApp>
        </ConfigProvider>
      </BrowserRouter>
      </PropertyProvider>
    </Provider>
  );
}

export default App;
