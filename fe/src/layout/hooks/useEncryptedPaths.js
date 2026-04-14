import { useMemo } from 'react';
import { encryptPath } from '../../routes/pathEncoding';

export const useEncryptedPaths = (menuGroups) => {
  return useMemo(() => {
    const collectPaths = (groups) => {
      const paths = {};

      groups?.forEach?.((item) => {
        if (item.path) {
          paths[item.path] = `/${encryptPath(item.path)}`;
        }

        if (item.items) {
          Object.assign(paths, collectPaths(item.items));
        }
      });

      return paths;
    };

    return collectPaths(menuGroups || []);
  }, [menuGroups]);
};
