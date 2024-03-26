import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CardSelect } from '~/components/CardSelect';
import { useServerCategires } from '~/routes/Servers/hooks/useServerCategories';
import { mkUseStyles } from '~/utils/theme';
import { MdKeyboardCommandKey } from 'react-icons/md';
import { MdOutlineDisplaySettings } from 'react-icons/md';

export const ManageServer = () => {
  const styles = useStyles();
  const { serverId } = useParams();
  const { categories } = useServerCategires(serverId);

  const [selecredCard, setSelectedCard] = useState<string>();

  const getItems = () => {
    const items =
      categories?.map((c) => ({
        label: c.name || c.value,
        value: c.value,
        icon: <MdKeyboardCommandKey size={20} />,
      })) || [];
    items.push({
      label: 'Settings',
      value: 'settings',
      icon: <MdOutlineDisplaySettings size={20} />,
    });
    return items;
  };

  return (
    <>
      {categories && (
        <CardSelect
          style={styles.cards}
          items={getItems()}
          handleSelect={setSelectedCard}
          selected={selecredCard || categories[0].value}
        />
      )}
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {},
  cards: {
    margin: -t.spacing.m,
    flexDirection: 'row',
  },
  cardContainer: {
    overflow: 'hidden',
  },
  card: {
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    boxShadow: `${t.colors.gray03 + t.colorOpacity(0.8)} 0px -40px 0px 20px`,
  },
  cardDisabled: {
    backgroundColor: t.colors.gray03,
    opacity: 0.8,
    color: t.colors.dark05,
  },
  separator: {
    backgroundColor: t.colors.gray03,
    opacity: 0.8,
    height: '100%',
    flex: 1,
  },
}));
