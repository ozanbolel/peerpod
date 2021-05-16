import * as React from "react";
import Linkify from "react-linkify";
import Marquee from "react-fast-marquee";
import { Button, Form } from "elements";
import { useRTC, playFeedback, useLocalStream, cns } from "utils";
import { useRTCContext } from "store";
import { IPeer, ISongInfo } from "types";
import css from "./Room.module.scss";

const Peer: React.FC<{
  peer: IPeer;
  remoteStream: MediaStream;
  remoteAudio: HTMLAudioElement | null;
}> = ({ peer, remoteStream, remoteAudio }) => {
  const refTrack = React.useRef<MediaStreamTrack | undefined>(undefined);

  React.useEffect(() => {
    peer.connection.ontrack = async (event) => {
      remoteStream.addTrack(event.track);
      if (remoteAudio) remoteAudio.srcObject = remoteStream.clone();
      refTrack.current = event.track;
    };
    playFeedback("on");

    return () => {
      if (refTrack.current) remoteStream.removeTrack(refTrack.current);
      playFeedback("off");
    };
  }, []);

  return (
    <div
      className={css.peer}
      onClick={() => {
        remoteAudio?.play();
      }}
    >
      {peer.nickname}
    </div>
  );
};

const Chat: React.FC<{ sendMessage: Function }> = ({ sendMessage }) => {
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
    <div className={css.chat}>
      <div className={css.chatInner}>
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

      <Marquee gradientWidth={12}>
        <span className={css.songbarText}>{songQueue[songIndex].title}</span>
      </Marquee>
    </button>
  );
};

const Room: React.FC<{ roomId: string }> = ({ roomId }) => {
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
  const refIsConnectedBefore = React.useRef(false);

  React.useEffect(() => {
    const storedNickname = localStorage.getItem("NICKNAME");
    if (storedNickname) setNickname(storedNickname);
  }, []);

  React.useEffect(() => {
    const songAudio = refSongAudio.current;

    if (songAudio && songQueue) {
      if (songAudio.srcObject) songAudio.srcObject = null;
      songAudio.src = songQueue[songIndex].url;
      songAudio.onended = goNextSong;
      songAudio.onerror = goNextSong;
    }
  }, [JSON.stringify(songQueue), songIndex]);

  React.useEffect(() => {
    if (!isConnected && refIsConnectedBefore.current) {
      const songAudio = refSongAudio.current;
      if (songAudio) songAudio.pause();
    }
  }, [isConnected]);

  const onSubmit = () => {
    localStorage.setItem("NICKNAME", nickname);
    connect();

    const remoteAudio = refRemoteAudio.current;
    const songAudio = refSongAudio.current;

    if (remoteAudio) {
      remoteAudio.srcObject = new MediaStream();
      remoteAudio.play();
    }

    if (songAudio) {
      songAudio.srcObject = new MediaStream();
      songAudio.volume = 0.035;
      songAudio.play();
    }

    refIsConnectedBefore.current = true;
  };

  const onClickSongbar = () => {
    const songAudioElement = refSongAudio.current;
    if (songAudioElement) songAudioElement.muted = !songAudioElement.muted;
  };

  return (
    <div
      className={cns([
        css.container,
        [css.connected, isConnected],
        [css.muted, isMuted]
      ])}
    >
      <div className={css.tint} />

      <div className={css.inner}>
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

        {isConnected && <Chat sendMessage={sendMessage} />}

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

        {React.useMemo(
          () => (
            <audio ref={refRemoteAudio} autoPlay />
          ),
          []
        )}

        {React.useMemo(
          () => (
            <audio ref={refSongAudio} autoPlay />
          ),
          []
        )}

        {isConnected && songQueue && (
          <Songbar
            songQueue={songQueue}
            songIndex={songIndex}
            onClick={onClickSongbar}
          />
        )}
      </div>
    </div>
  );
};

export default Room;
