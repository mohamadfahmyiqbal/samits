import { useMemo } from 'react';
import { encryptPath } from '../router/encryptPath';

export const useEncryptedPaths = (menuGroups) => {
  return useMemo(() => {
    const pathMap = new Map();
    
    const processItems = (items) => {
      items.forEach((item) => {
        if (item.path) {
          pathMap.set(item.path, `/${encryptPath(item.path)}`);
        }
        if (item.items) {
          processItems(item.items);
        }
      });
    };

    menuGroups.forEach((group) => {
      if (group.type === 'link') {
        pathMap.set(group.path, `/${encryptPath(group.path)}`);
      } else if (group.items) {
        processItems(group.items);
      }
    });
    
    return pathMap;
  }, [menuGroups]);
};
