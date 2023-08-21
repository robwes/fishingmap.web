import React from 'react';
import CallToAction from '../../components/ui/buttons/CallToAction';
import hero from '../../assets/images/hero.png';
import './LandingPage.scss';

function LandingPage() {
    return (
        <div className='landing-page page'>
            <div className='landing-container'>
                <div className='left'>
                    <h1 className='landing-title'>
                        Find the best<br />
                        fishing spots in<br />
                        Uusimaa
                    </h1>
                    <p className='landing-subtitle'>
                        This fishing map makes <b>fishing</b> in Uusimaa <b>simple and easy</b>.
                        Find all the information that you need for each location.
                        Fish species, permits, rules and restrictions.
                    </p>
                    <CallToAction to="/map">Let's go fishing!</CallToAction>
                </div>
                <div className='right'>
                    <img
                        className='hero-image'
                        src={hero}
                        alt='preview of the fishing map'
                    />
                </div>
            </div>
        </div>
    )
}

export default LandingPage