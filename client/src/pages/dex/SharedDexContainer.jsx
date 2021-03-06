import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Dex from "./Dex";
import * as Loader from "../../components/styles/Loader";
import { MoonLoader } from "react-spinners";
import { Helmet } from "react-helmet-async";
import makeRequest from "../../helpers/makeRequest";
import { useAuth } from "../../hooks/useAuth";

const fetchDex = async (id, username) => {
  const res = await makeRequest(`/api/shared/${username}/dex?id=${id}`);
  const data = await res.json();
  return { data, res };
};

const fetchNotes = async (id, username) => {
  const res = await makeRequest(`/api/shared/${username}/dex/note?id=${id}`);
  return res.json();
};

const DexContainer = ({ history }) => {
  const { id, username } = useParams();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [dex, setDex] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      if (id && username) {
        try {
          setLoading(true);
          const { res, data } = await fetchDex(id, username);
          if (res.status === 404) {
            history.push("/");
          }
          const _data = await fetchNotes(id, data.user_id);

          if (_data.status && _data.status === "error") {
            throw new Error();
          }

          setNotes(_data);

          setDex(data);
          setLoading(false);
        } catch (err) {
          history.push("/");
        }
      }
    })();

    return () => {
      setNotes([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (loading) {
    return (
      <Loader.Container hide={!loading} secondary>
        <MoonLoader color="#B8D0EC" />
      </Loader.Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Leaguedex - Shared Champion Dex</title>
      </Helmet>
      <Dex
        setDex={setDex}
        shared={true}
        createNote={() => null}
        notes={notes}
        history={history}
        dex={dex}
        loading={loading}
        isLive={() => false}
      />
    </>
  );
};

export default DexContainer;
