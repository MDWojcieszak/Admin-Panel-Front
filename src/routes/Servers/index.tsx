import { ServerType } from '~/api/Server';
import { ServerTile } from '~/routes/Servers/components/ServerTile';
import { useServers } from '~/routes/Servers/hooks/useServers';

export const Servers = () => {
  const { servers } = useServers();

  const renderItem = (server: ServerType) => {
    return <ServerTile server={server} />;
  };

  return <div>{servers?.map(renderItem)}</div>;
};
