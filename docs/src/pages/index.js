import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import React from 'react';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className='hero hero--primary'>
            <div className="container">
                <h1 className="hero__title">🦤 → 🦣+☁️<br/>{siteConfig.title}</h1>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/discover">
                        Discover Touitomamout - 5min ⏱️
                    </Link>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/configuration">
                        Setup
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Hello from ${siteConfig.title}`}
            description="Touitomamout documentation center | Home">
            <HomepageHeader />
            <main>
                <div className={styles.heroBanner}/>
            </main>
        </Layout>
    );
}
