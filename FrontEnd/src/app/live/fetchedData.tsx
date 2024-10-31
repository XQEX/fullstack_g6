import React from "react";
import "dotenv/config";

async function getList() {
  const res = await fetch(
    `http://${process.env.WEB_HOST}:4000/api/live-streams/get`,
    {
      credentials: "include",
    }
  );

  return res.json();
}

async function fetchData() {
  const LiveList = await getList();
  return LiveList;
}

export default fetchData();
