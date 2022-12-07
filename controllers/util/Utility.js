export const CheckNilai = (nilai) => {
  if (!nilai || isNaN(nilai)) return 0;

  return nilai;
};

export const totalCol = (dataTable, namecol) => {
  return dataTable.reduce(
    (sum, item) =>
      parseInt(CheckNilai(sum)) + parseInt(CheckNilai(item[namecol])),
    0
  );
};
