import * as React from "react";
import { Button, Form } from "elements";
import { useRTC, playFeedback, useLocalStream, cns, generateId } from "tools";
import { useRTCContext } from "store";
import { IPeer } from "types";
import css from "./Home.module.scss";

const PeerCard: React.FC<{ peer: IPeer }> = ({ peer }) => {
  const refAudio = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    const audioElement = refAudio.current;

    if (audioElement) {
      playFeedback("on");

      peer.connection.ontrack = async (event) => {
        const stream = new MediaStream();
        stream.addTrack(event.track);

        audioElement.srcObject = stream;
        audioElement.pause();
        audioElement.play();
      };

      return () => {
        playFeedback("off");
      };
    }
  }, []);

  return (
    <div className={css.peerCard}>
      <span>{peer.nickname}</span>
      <audio ref={refAudio} autoPlay />
    </div>
  );
};

const Peers: React.FC = () => {
  const { state } = useRTCContext();

  return (
    <div className={css.peerCardGrid}>
      {state.peers.map((peer) => (
        <PeerCard key={peer.id} peer={peer} />
      ))}
    </div>
  );
};

const Messages: React.FC<{ sendMessage: Function }> = ({ sendMessage }) => {
  const [message, setMessage] = React.useState("");
  const { state } = useRTCContext();
  const refMessages = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const elemMessages = refMessages.current;
    if (elemMessages) elemMessages.scrollTop = elemMessages.scrollHeight;

    if (state.messages.length !== 0) playFeedback("message");
  }, [state.messages]);

  const onSubmit = () => {
    if (message.trim().length !== 0) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className={css.messages}>
      <div ref={refMessages} className={css.messageList}>
        {state.messages.map((message) => (
          <div key={message.id} className={css.messageItem}>
            <span className={css.bold}>{message.nickname}: </span>
            <span>{message.message}</span>
          </div>
        ))}
      </div>

      <Form onSubmit={onSubmit}>
        <Form.Input controller={[message, setMessage]} placeholder="Message..." required />
        <Form.Submit label="SEND" noSound />
      </Form>
    </div>
  );
};

const Home: React.FC = () => {
  const [roomId, setRoomId] = React.useState(generateId());
  const [nickname, setNickname] = React.useState("");
  const { startLocalStream, localStream, stopLocalStream, toggleMuted, isMuted } = useLocalStream();
  const { connect, disconnect, isConnected, sendMessage } = useRTC(roomId, nickname, startLocalStream, localStream, stopLocalStream);

  React.useEffect(() => {
    const storedRoomId = localStorage.getItem("ROOM_ID");
    const storedNickname = localStorage.getItem("NICKNAME");

    if (storedRoomId) setRoomId(storedRoomId);
    if (storedNickname) setNickname(storedNickname);
  }, []);

  const onSubmit = () => {
    localStorage.setItem("ROOM_ID", roomId);
    localStorage.setItem("NICKNAME", nickname);
    connect();
  };

  return (
    <div className={cns([css.homeContainer, [css.connected, isConnected], [css.muted, isMuted]])}>
      <div className={css.tint} />

      <div className={css.home}>
        <Peers />

        {isConnected ? <Messages sendMessage={sendMessage} /> : null}

        <div className={css.actionbar}>
          {isConnected ? (
            <>
              <Button label="CONNECTED" onClick={() => disconnect()} active={true} />
              <Button label={isMuted ? "MUTED" : "MUTE"} onClick={() => toggleMuted()} active={isMuted} />
            </>
          ) : (
            <Form onSubmit={onSubmit}>
              <Form.Input controller={[roomId, setRoomId]} placeholder="Room ID..." length={16} required />
              <Form.Input controller={[nickname, setNickname]} placeholder="Nickname..." minLength={2} maxLength={36} required />
              <Form.Submit label="CONNECT" />
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
