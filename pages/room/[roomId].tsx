import * as React from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { ROOM_ID_LENGTH } from "config";
import Room from "components/room/Room/Room";

const RoomPage: NextPage = () => {
  const router = useRouter();
  const roomId = router.query.roomId as string | undefined;

  React.useEffect(() => {
    if (roomId && roomId.length !== ROOM_ID_LENGTH) router.replace("/");
  }, [roomId]);

  if (roomId && roomId.length === ROOM_ID_LENGTH) {
    return <Room roomId={roomId} />;
  } else {
    return null;
  }
};

export default RoomPage;
