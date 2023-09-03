import React from 'react';
import './CardImage.scss';

function CardImage({ src, alt }) {
    return (
        <img
            className="card-image"
            src={src}
            alt={alt}
        />
    )
}

export default CardImage