import * as React from "react";
import Linkify from "react-linkify";
import { Button, Form } from "elements";
import {
  useRTC,
  playFeedback,
  useLocalStream,
  cns,
  generateId,
  formatString
} from "utils";
import { useRTCContext } from "store";
import { IPeer } from "types";
import css from "./Home.module.scss";

const PeerCard: React.FC<{
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

  return (
    <div className={css.peerCard}>
      <span>{peer.nickname}</span>
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
  );
};

interface IHomeProps {
  predefinedRoomId?: string;
}

const Home: React.FC<IHomeProps> = ({ predefinedRoomId }) => {
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
  }, [songQueue, songIndex]);

  React.useEffect(() => {
    if (!isConnected) {
      const songAudio = refSongAudio.current;

      if (songAudio && !songAudio.paused) {
        songAudio.pause();
      }
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
        <div className={css.peerCardGrid}>
          {peers.map((peer) => (
            <PeerCard
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
          <button
            className={css.songbar}
            onClick={() => {
              const songAudioElement = refSongAudio.current;

              if (songAudioElement) {
                songAudioElement.muted = !songAudioElement.muted;
              }
            }}
          >
            {songQueue.length > 1 && (
              <div className={css.queue}>
                {songIndex + 1} / {songQueue.length}
              </div>
            )}

            <div>{formatString(songQueue[songIndex].title, 50)}</div>
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
