import { CommandType } from '~/api/ServerCommands';
import { Button } from '~/components/Button';
import { useCommands } from '~/routes/Servers/hooks/useCommands';
import { mkUseStyles } from '~/utils/theme';

type CommanCardProps = {
  categoryId: string;
};

export const CommandCard = ({ categoryId }: CommanCardProps) => {
  const styles = useStyles();
  const { commands } = useCommands(categoryId);
  const renderCommand = (command: CommandType) => {
    return <Button label={command.name || command.value} variant='secondary' />;
  };
  return commands?.length ? (
    <div style={styles.container}>
      <div style={styles.header}>Commands</div>
      {commands && commands.map(renderCommand)}
    </div>
  ) : null;
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    marginBottom: t.spacing.s,
  },
  header: {},
}));
