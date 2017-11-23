export const options = <T extends string, K>(
  status: T,
  options: { [P in T]: () => K },
) => options[status]();
