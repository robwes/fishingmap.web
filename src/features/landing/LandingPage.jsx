import React from 'react';
import CallToAction from '@/features/landing/components/CallToAction';
import heroLocation from '@/assets/images/hero_location.png';
import heroMap from '@/assets/images/hero_map.png';
import './LandingPage.scss';

function LandingPage() {
    return (
        <div className='landing-page page'>
            <section className='landing-hero'>
                <div className='landing-container'>
                    <div className='left'>
                        <h1 className='landing-title'>
                            Find the best <span className='accent'>fishing spots</span> in Uusimaa
                        </h1>
                        <p className='landing-subtitle'>
                            Plan your next trip with <b>everything in one place</b> —
                            find a spot, check the rules, grab a permit and go fish.
                        </p>
                        <CallToAction to="/map">Let's go fishing!</CallToAction>
                    </div>
                    <div className='right'>
                        <div className='hero-composite'>
                            <img
                                className='hero-card hero-location'
                                src={heroLocation}
                                alt='preview of a fishing location with species and permits'
                            />
                            <img
                                className='hero-card hero-map'
                                src={heroMap}
                                alt=''
                                aria-hidden='true'
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className='landing-features'>
                <h2 className='features-title'>Everything you need to start fishing</h2>
                <div className='feature-cards'>
                    <div className='feature-card'>
                        <i className='fas fa-location-dot feature-icon' aria-hidden='true'></i>
                        <h3 className='feature-name'>Locations</h3>
                        <p className='feature-desc'>
                            Explore fishing spots across Uusimaa on an interactive map.
                        </p>
                    </div>
                    <div className='feature-card'>
                        <i className='fas fa-fish feature-icon' aria-hidden='true'></i>
                        <h3 className='feature-name'>Species</h3>
                        <p className='feature-desc'>
                            Know what you can catch, with size limits and seasonal restrictions.
                        </p>
                    </div>
                    <div className='feature-card'>
                        <i className='fas fa-ticket feature-icon' aria-hidden='true'></i>
                        <h3 className='feature-name'>Permits</h3>
                        <p className='feature-desc'>
                            See exactly which permits you need before heading out.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default LandingPage
