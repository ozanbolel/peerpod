import * as React from "react";
import Linkify from "react-linkify";
import Marquee from "react-fast-marquee";
import { Button, Form } from "elements";
import { useRTC, playFeedback, useLocalStream, cns, generateId } from "utils";
import { useRTCContext } from "store";
import { IPeer, ISongInfo } from "types";
import css from "./Home.module.scss";

const Peer: React.FC<{
  peer: IPeer;
  remoteStream: MediaStream;
  remoteAudio: HTMLAudioElement | null;
}> = ({ peer, remoteStream, remoteAudio }) => {
  React.useEffect(() => {
    playFeedback("on");

    peer.connection.ontrack = async (event) => {
      remoteStream.addTrack(event.track);
      if (remoteAudio) {
        remoteAudio.muted = true;
        remoteAudio.muted = false;
      }
    };

    return () => {
      playFeedback("off");
    };
  }, []);

  return <div className={css.peer}>{peer.nickname}</div>;
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
      <div className={css.messagesInner}>
        <div ref={refMessages} className={css.messageList}>
          {state.messages.map((message) => (
            <div key={message.id} className={css.messageItem}>
              <span className={css.bold}>{message.nickname}: </span>

              <span>
                <Linkify
                  componentDecorator={(decoratedHref, decoratedText, key) => (
                    <a
                      key={key}
                      href={decoratedHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {decoratedText}
                    </a>
                  )}
                >
                  {message.message}
                </Linkify>
              </span>
            </div>
          ))}
        </div>

        <Form onSubmit={onSubmit}>
          <Form.Input
            controller={[message, setMessage]}
            placeholder="Message..."
            required
          />
          <Form.Submit label="SEND" noSound />
        </Form>
      </div>
    </div>
  );
};

const Songbar: React.FC<{
  songQueue: ISongInfo[];
  songIndex: number;
  onClick?: () => void;
}> = ({ songQueue, songIndex, onClick }) => {
  React.useEffect(() => {
    playFeedback("on");
  }, []);

  return (
    <button className={css.songbar} onClick={onClick}>
      {songQueue.length > 1 ? (
        <div className={css.songbarTitle}>
          <span>Now playing</span>
          <span className={css.info}>
            {songIndex + 1}/{songQueue.length}
          </span>
        </div>
      ) : (
        <div className={css.songbarTitle}>Now playing</div>
      )}

      <Marquee gradientWidth={15}>
        <span className={css.songbarText}>{songQueue[songIndex].title}</span>
      </Marquee>
    </button>
  );
};

const Home: React.FC<{ predefinedRoomId?: string }> = ({
  predefinedRoomId
}) => {
  const [roomId, setRoomId] = React.useState(predefinedRoomId || generateId());
  const [nickname, setNickname] = React.useState("");
  const {
    startLocalStream,
    localStream,
    stopLocalStream,
    toggleMuted,
    isMuted
  } = useLocalStream();
  const {
    connect,
    disconnect,
    isConnected,
    sendMessage,
    songQueue,
    songIndex,
    peers,
    goNextSong
  } = useRTC(roomId, nickname, startLocalStream, localStream, stopLocalStream);
  const remoteStream = React.useRef(
    typeof window !== "undefined" ? new MediaStream() : undefined
  ).current as MediaStream;
  const refRemoteAudio = React.useRef<HTMLAudioElement>(null);
  const refSongAudio = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (!predefinedRoomId) {
      const storedRoomId = localStorage.getItem("ROOM_ID");
      if (storedRoomId) setRoomId(storedRoomId);
    }

    const storedNickname = localStorage.getItem("NICKNAME");
    if (storedNickname) setNickname(storedNickname);
  }, []);

  React.useEffect(() => {
    const songAudio = refSongAudio.current;

    if (songAudio && songQueue) {
      songAudio.src = songQueue[songIndex].url;
      songAudio.onended = goNextSong;
      songAudio.play();
    }
  }, [JSON.stringify(songQueue), songIndex]);

  React.useEffect(() => {
    if (!isConnected) {
      const songAudio = refSongAudio.current;
      if (songAudio) songAudio.src = "";
    }
  }, [isConnected]);

  const onSubmit = () => {
    if (!predefinedRoomId) localStorage.setItem("ROOM_ID", roomId);
    localStorage.setItem("NICKNAME", nickname);
    connect();

    const remoteAudio = refRemoteAudio.current;
    const songAudio = refSongAudio.current;

    if (remoteAudio) {
      remoteAudio.srcObject = remoteStream;
      remoteAudio.play();
    }

    if (songAudio) {
      songAudio.volume = 0.04;
      songAudio.play();
    }
  };

  return (
    <div
      className={cns([
        css.homeContainer,
        [css.connected, isConnected],
        [css.muted, isMuted]
      ])}
    >
      <div className={css.tint} />

      <div className={css.home}>
        <div className={css.peerGrid}>
          {peers.map((peer) => (
            <Peer
              key={peer.id}
              peer={peer}
              remoteStream={remoteStream}
              remoteAudio={refRemoteAudio.current}
            />
          ))}
        </div>

        {isConnected ? <Messages sendMessage={sendMessage} /> : null}

        <div className={css.actionbar}>
          {isConnected ? (
            <>
              <Button
                label="CONNECTED"
                onClick={() => disconnect()}
                active={true}
              />
              <Button
                label={isMuted ? "MUTED" : "MUTE"}
                onClick={() => toggleMuted()}
                active={isMuted}
              />
            </>
          ) : (
            <Form onSubmit={onSubmit}>
              {!predefinedRoomId && (
                <Form.Input
                  controller={[roomId, setRoomId]}
                  placeholder="Room ID..."
                  length={16}
                  required
                />
              )}
              <Form.Input
                controller={[nickname, setNickname]}
                placeholder="Nickname..."
                minLength={2}
                maxLength={36}
                required
              />
              <Form.Submit label="CONNECT" />
            </Form>
          )}
        </div>

        <audio ref={refRemoteAudio} />
        <audio ref={refSongAudio} />

        {isConnected && songQueue && (
          <Songbar
            songQueue={songQueue}
            songIndex={songIndex}
            onClick={() => {
              const songAudioElement = refSongAudio.current;

              if (songAudioElement) {
                songAudioElement.muted = !songAudioElement.muted;
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
