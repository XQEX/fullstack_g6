import React from "react";

function UserCard(props: any) {
  const isOnline = props.onlineUsers.find(
    (user: any) => user.id === props.user.id
  );

  return (
    <>
      <div
        className={`border rounded-lg shadow-lg p-3 w-80 h-35 m-3 ${
          isOnline ? "bg-[#41B3A2]" : "bg-inherit"
        }`}
      >
        <p className="text-sm font-semibold">{props.user.name}</p>
      </div>
    </>
  );
}

export default UserCard;
