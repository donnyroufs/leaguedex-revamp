import React, { createContext, useContext, useState } from "react";
import { getToken } from "../helpers/getToken";

const matchContext = createContext();

export const MatchProvider = ({ children }) => {
  const match = useMatchProvider();
  return (
    <matchContext.Provider value={match}>{children}</matchContext.Provider>
  );
};

export const useMatch = () => {
  return useContext(matchContext);
};

const useMatchProvider = () => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const findMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matchup/find`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        credentials: "include",
      });
      const data = await res.json();
      setMatch(data.hasOwnProperty("status") ? null : data);
      setLoading(false);
      return data.hasOwnProperty("status");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return {
    match,
    loading,
    findMatch,
    hasMatch: !!match,
  };
};