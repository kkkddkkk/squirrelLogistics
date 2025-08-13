const useAddressSearch = () => {
  const open = (onSelect) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        onSelect?.(data.address);
      },
    }).open();
  };
  return { open };
};

export default useAddressSearch;
