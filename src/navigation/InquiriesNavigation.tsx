import { Route, Routes } from 'react-router-dom';
import { InquiryNavigationRoute } from '~/navigation/types';
import { InquiriesInbox } from '~/routes/Inquiries';
import { ContactFormSettings } from '~/routes/Inquiries/ContactFormSettings';
import { mkUseStyles } from '~/utils/theme';

/** Contact inquiries from the public gallery: the inbox and the form's settings. */
export const InquiriesNavigation = () => {
  const styles = useStyles();
  return (
    <div style={styles.content}>
      <Routes>
        <Route index element={<InquiriesInbox />} />
        <Route path={InquiryNavigationRoute.SETTINGS} element={<ContactFormSettings />} />
      </Routes>
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  content: {
    flex: 1,
    minHeight: 0,
    height: '100%',
    display: 'flex',
  },
}));
