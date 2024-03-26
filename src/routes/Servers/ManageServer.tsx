import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CardSelect } from '~/components/CardSelect';
import { useServerCategires } from '~/routes/Servers/hooks/useServerCategories';
import { mkUseStyles } from '~/utils/theme';
import { MdKeyboardCommandKey } from 'react-icons/md';
import { MdOutlineDisplaySettings } from 'react-icons/md';
import { CommandCard } from '~/routes/Servers/components/CommandCard';

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
      <div style={styles.contentContainer}>
        <CommandCard categoryId={categories?.find((c) => c.value === selecredCard)?.id || ''} />
      </div>
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  cards: {
    margin: -t.spacing.m,
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    marginTop: t.spacing.xl,
  },
}));
