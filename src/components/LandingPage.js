import React from 'react'
import { Link } from 'react-router-dom'
import './components.css'
import './common/form/form.css'

function LandingPage() {
    return (
        <div className='landing-page'>
            <div className='landing-container'>
                <div className='left'>
                    <h1 className='landing-title'>
                        Find the best<br />
                        fishing spots in<br />
                        Uusimaa
                    </h1>
                    <p className='landing-subtitle'>Looking for fishing locations in Uusimaa?<br />
                        This fishing map helps you find the<br />
                        best ones easily.</p>
                    <Link to="/map" className='button call-to-action'>Let's go fishing!</Link>
                </div>
                <div className='right'>
                    <img
                        className='hero-image'
                        src='../images/landing/hero.png'
                        alt='preview of the fishing map'
                    />
                </div>
            </div>
        </div>
    )
}

export default LandingPage