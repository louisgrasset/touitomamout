import Link from "@docusaurus/Link";
import clsx from "clsx";
import PropTypes from "prop-types";
import React from "react";

import styles from "./styles.module.css";

const PlatformList = [
  {
    name: "Docker",
    icon: "🐳",
  },
  {
    name: "Cron",
    icon: "⏰",
  },
  {
    name: "PM2",
    icon: "⏲️",
  },
  {
    name: "Manual sync",
    icon: "👏️",
  },
];

Platform.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

PlatformList.propTypes = Array.from(Platform.propTypes);

function Platform({ icon, name }) {
  const page = name.toLowerCase().replaceAll(" ", "-");
  return (
    <Link
      href={`/docs/configuration/${page}`}
      className={clsx("col col--5", styles.platformLink)}
    >
      <div className={styles.platformLabel}>
        <span className={styles.platformIcon} role="img" aria-hidden={true}>
          {icon}
        </span>
        <h3 className={styles.platformName}>
          Configure with
          <br />
          <span className={styles.platformNameSpan}>{name}</span>
        </h3>
      </div>
    </Link>
  );
}

export default function Index() {
  return (
    <section>
      <div className="container">
        <div className={clsx(["row", styles.platformsWrapper])}>
          {PlatformList.map((props) => (
            <Platform key={props.name} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
