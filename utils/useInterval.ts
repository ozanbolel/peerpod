import * as React from "react";

export const useInterval = (
  callback: () => void,
  delay: number,
  deps?: React.DependencyList
) => {
  const refCallback = React.useRef<typeof callback | undefined>();

  React.useEffect(() => {
    refCallback.current = callback;
  }, [callback, deps]);

  React.useEffect(() => {
    const tick = () => {
      if (refCallback.current) refCallback.current();
    };

    const id = setInterval(tick, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay]);
};
