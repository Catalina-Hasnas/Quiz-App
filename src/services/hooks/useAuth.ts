import { useState, useCallback, useEffect } from "react";

let logoutTimer: ReturnType<typeof setTimeout>;

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState<Date>();
  const [userId, setUserId] = useState<string | null>(null);

  const addUserInfoInLocalStorage = useCallback(
    (id: string, token: string, expirationDate?: Date) => {
      setToken(token);
      setUserId(id);
      const tokenExpirationDate =
        expirationDate || new Date(new Date().getTime() + 1000 * 60 * 180);
      setTokenExpirationDate(tokenExpirationDate);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          userId: id,
          token: token,
          expiration: tokenExpirationDate.toISOString(),
        })
      );
    },
    []
  );

  const removeUserInfoFromLocalStorage = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(undefined);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(removeUserInfoFromLocalStorage, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, removeUserInfoFromLocalStorage, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      addUserInfoInLocalStorage(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [addUserInfoInLocalStorage]);
  return {
    token,
    addUserInfoInLocalStorage,
    removeUserInfoFromLocalStorage,
    userId,
  };
};
