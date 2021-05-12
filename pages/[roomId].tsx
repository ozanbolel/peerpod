import * as React from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Home from "components/home/Home/Home";

const PredefinedRoomPage: NextPage = () => {
  const router = useRouter();
  const predefinedRoomId = router.query.roomId as string | undefined;

  if (predefinedRoomId) {
    return <Home predefinedRoomId={predefinedRoomId} />;
  } else {
    return null;
  }
};

export default PredefinedRoomPage;
