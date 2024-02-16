const crnd = (min: number, max: number) => {
  return (Math.random() * (max - min) + min).toFixed();
};

export const generateRoomId = () => {
  const prefix = 'abcde'[+crnd(0, 4)];
  const middle = crnd(10, 100);
  const postfix = 'xyz'[+crnd(0, 2)];
  return `${prefix}${middle}${postfix}`;
};

export const generatePlayerId = () => {
  let id = '';
  while (id.length < 6) {
    const segment = 'mnopq'[+crnd(0, 2)] + crnd(0, 9);
    id += segment;
  }
  return id;
};
