import { useState } from 'react';

export const useModal = (initialVisible = false) => {
  const [visible, setVisible] = useState(initialVisible);
  const [data, setModalData] = useState(null);

  const showModal = (modalData = null) => {
    setModalData(modalData);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setModalData(null);
  };

  const toggleModal = () => {
    setVisible(!visible);
  };

  return {
    visible,
    data,
    showModal,
    hideModal,
    toggleModal
  };
};

export default useModal;
