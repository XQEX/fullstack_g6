import React from "react";

async function getList() {
  const res = await fetch("http://g6-backend:4000/api/live-streams/get", {
    credentials: "include",
  });

  return res.json();
}

async function fetchData() {
  const LiveList = await getList();
  return LiveList;
}

export default fetchData();
