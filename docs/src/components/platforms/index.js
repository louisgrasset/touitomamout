import Link from '@docusaurus/Link';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';

const PlatformList = [
    {
        name: 'Docker',
        icon: '🐳',
    },
    {
        name: 'Cron',
        icon: '⏰',
    },
    {
        name: 'PM2',
        icon: '⏲️',
    },
    {
        name: 'Manual sync',
        icon: '👏️',
    },
];

function Platform({ icon, name }) {
    const page = name.toLowerCase().replaceAll(' ', '-');
    return (
        <Link href={`/docs/configuration/${page}`} className={clsx('col col--5', styles.platformLink)}>
            <div className={styles.platformLabel}>
                <span className={styles.platformIcon} role="img" aria-hidden={true}>{icon}</span>
                <h3 className={styles.platformName}>Configure with<br/><span className={styles.platformNameSpan}>{name}</span></h3>
            </div>
        </Link>
    );
}

export default function Index() {
    return (
        <section>
            <div className="container">
                <div className={clsx(['row',styles.platformsWrapper])}>
                    {PlatformList.map((props, idx) => (
                        <Platform key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
