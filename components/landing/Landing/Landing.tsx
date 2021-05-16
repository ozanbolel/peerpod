import * as React from "react";
import Link from "next/link";
import { Button } from "elements";
import { generateId } from "utils";
import css from "../../room/Room/Room.module.scss";

const Landing: React.FC = () => {
  const href = React.useRef(`/room/${generateId()}`).current;

  return (
    <div className={css.container}>
      <div className={css.tint} />

      <div className={css.inner}>
        <div className={css.peerGrid} />

        <div className={css.actionbar}>
          <Link href={href}>
            <a>
              <Button label="CREATE A ROOM" className={css.large} />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
