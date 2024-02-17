import ReactDOM from 'react-dom/client';
import { AppProvider } from './AppProvider';
import './index.css';
import { AppNavigation } from './navigation';
import { theme } from './utils/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppProvider theme={theme}>
    <AppNavigation />
  </AppProvider>,
);
